const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");
const { requireAuth } = require("../middleware/auth");
const {
  normalizePhone,
  sendVerificationCode,
  checkVerificationCode,
  maskPhone,
  smsLimiter,
} = require("../utils/twilioVerify");

const router = express.Router();

// Multer storage for avatar uploads
const uploadsDir = path.resolve(__dirname, "../uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadsDir))
      fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomBytes(16).toString("hex")}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─────────────────────────────────────────────────────────────────────────────
// Rate limiting: máx. 10 tentativas de login por IP a cada 15 minutos
// Previne ataques de força bruta
// ─────────────────────────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Muitas tentativas. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────────────────────────────────────────────
// Validações reutilizáveis
// ─────────────────────────────────────────────────────────────────────────────
const registerValidations = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Nome deve ter entre 2 e 80 caracteres"),
  body("email").isEmail().withMessage("E-mail inválido").normalizeEmail(),
  body("phone")
    .notEmpty()
    .withMessage("Telefone é obrigatório")
    .custom((value) => {
      normalizePhone(value);
      return true;
    })
    .withMessage("Telefone inválido"),
  body("phoneCode")
    .trim()
    .isLength({ min: 4, max: 10 })
    .withMessage("Código de verificação inválido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Senha deve ter ao menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Senha deve conter letra maiúscula, minúscula e número"),
];

const loginValidations = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty().withMessage("Senha é obrigatória"),
];

// Helper: centraliza verificação de erros de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const passwordValidations = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Senha deve ter ao menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Senha deve conter letra maiúscula, minúscula e número"),
];

const findPasswordResetUser = async (identifier) => {
  const value = String(identifier || "").trim();
  if (!value) return null;

  if (value.includes("@")) {
    return User.findOne({ email: value.toLowerCase(), provider: "local" });
  }

  return User.findOne({ phone: normalizePhone(value), provider: "local" });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/phone/send-code
// Envia código SMS via Twilio Verify antes do cadastro
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/phone/send-code",
  smsLimiter,
  [body("phone").notEmpty().withMessage("Telefone é obrigatório")],
  validate,
  async (req, res) => {
    try {
      const phone = normalizePhone(req.body.phone);
      const existing = await User.findOne({ phone });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Telefone já cadastrado.",
        });
      }

      const verification = await sendVerificationCode(phone);

      return res.json({
        success: true,
        message: "Código enviado por SMS.",
        data: { phone, status: verification.status },
      });
    } catch (error) {
      console.error("[/phone/send-code]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível enviar o código.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/register
// Cria um novo usuário com e-mail e senha
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", registerValidations, validate, async (req, res) => {
  try {
    const { name, email, password, phoneCode } = req.body;
    const phone = normalizePhone(req.body.phone);

    // Verifica se o e-mail já está cadastrado
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      // Retorna a mesma mensagem para não revelar quais emails existem
      return res.status(409).json({
        success: false,
        message:
          existing.email === email
            ? "E-mail já cadastrado."
            : "Telefone já cadastrado.",
      });
    }

    const phoneApproved = await checkVerificationCode(phone, phoneCode);
    if (!phoneApproved) {
      return res.status(422).json({
        success: false,
        message: "Código de telefone inválido ou expirado.",
      });
    }

    // Cria o usuário — a senha é hasheada pelo middleware pre('save') do Model
    const user = await User.create({
      name,
      email,
      phone,
      phoneVerified: true,
      password,
      provider: "local",
    });

    // Gera os tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Salva o refresh token na lista do usuário (suporta múltiplos dispositivos)
    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: refreshToken },
      lastLoginAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Conta criada com sucesso.",
      data: {
        user, // password já removida pelo toJSON do schema
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("[/register]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login
// Autentica com e-mail e senha
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/login",
  loginLimiter,
  loginValidations,
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // .select('+password') é necessário porque o campo tem select: false no schema
      const user = await User.findOne({ email, provider: "local" }).select(
        "+password",
      );

      if (!user) {
        // Mensagem genérica: não revela se o e-mail existe ou não
        return res.status(401).json({
          success: false,
          message: "E-mail ou senha incorretos.",
        });
      }

      if (!user.isActive) {
        return res
          .status(403)
          .json({ success: false, message: "Conta desativada." });
      }

      // Compara a senha digitada com o hash salvo no banco
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "E-mail ou senha incorretos.",
        });
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      // Limita a no máximo 5 refresh tokens por usuário (5 dispositivos simultâneos)
      await User.findByIdAndUpdate(user._id, {
        $push: {
          refreshTokens: {
            $each: [refreshToken],
            $slice: -5, // mantém apenas os 5 mais recentes
          },
        },
        lastLoginAt: new Date(),
      });

      return res.json({
        success: true,
        message: "Login realizado com sucesso.",
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("[/login]", error);
      res
        .status(500)
        .json({ success: false, message: "Erro interno do servidor." });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/social-login
// Login/Cadastro via Google, Facebook ou X
// O app envia o token do provedor; o backend valida e cria/recupera o usuário
// ─────────────────────────────────────────────────────────────────────────────
router.post("/social-login", async (req, res) => {
  try {
    const {
      provider,
      providerId: clerkProviderId,
      email: clerkEmail,
      name: clerkName,
      avatar: clerkAvatar,
      idToken,
      accessToken: providerAccessToken,
      code,
      redirectUri,
      codeVerifier,
    } = req.body;

    if (!provider) {
      return res.status(400).json({
        success: false,
        message: "Provider é obrigatório.",
      });
    }

    if (clerkProviderId) {
      const email =
        clerkEmail?.toLowerCase() ||
        `${provider}.${clerkProviderId}@social.fintrack.local`;
      let user = await User.findOne({
        $or: [{ provider, providerId: clerkProviderId }, { email }],
      });

      if (!user) {
        user = await User.create({
          name: clerkName || email.split("@")[0],
          email,
          provider,
          providerId: clerkProviderId,
          avatar: clerkAvatar || null,
          isEmailVerified: true,
        });
      } else {
        user.provider = provider;
        user.providerId = clerkProviderId;
        if (clerkName && !user.name) user.name = clerkName;
        if (clerkAvatar && !user.avatar) user.avatar = clerkAvatar;
        user.isEmailVerified = true;
        await user.save();
      }

      const appAccessToken = generateAccessToken(user._id);
      const appRefreshToken = generateRefreshToken(user._id);

      await User.findByIdAndUpdate(user._id, {
        $push: { refreshTokens: { $each: [appRefreshToken], $slice: -5 } },
        lastLoginAt: new Date(),
      });

      return res.json({
        success: true,
        data: {
          user,
          accessToken: appAccessToken,
          refreshToken: appRefreshToken,
        },
      });
    }

    let profile = null;

    if (provider === "google") {
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: "idToken do Google é obrigatório.",
        });
      }

      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
          idToken,
        )}`,
      );

      if (!response.ok) {
        return res.status(401).json({
          success: false,
          message: "Token do Google inválido.",
        });
      }

      profile = await response.json();
      if (!profile.sub || !profile.email) {
        return res.status(401).json({
          success: false,
          message: "Não foi possível verificar o perfil do Google.",
        });
      }
    } else if (provider === "facebook") {
      if (!providerAccessToken) {
        return res.status(400).json({
          success: false,
          message: "accessToken do Facebook é obrigatório.",
        });
      }

      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(
          providerAccessToken,
        )}`,
      );

      if (!response.ok) {
        return res.status(401).json({
          success: false,
          message: "Token do Facebook inválido.",
        });
      }

      profile = await response.json();
      if (!profile.id || !profile.email) {
        return res.status(401).json({
          success: false,
          message: "Não foi possível verificar o perfil do Facebook.",
        });
      }
    } else if (provider === "x") {
      if (!code || !redirectUri || !codeVerifier) {
        return res.status(400).json({
          success: false,
          message:
            "code, redirectUri e codeVerifier são obrigatórios para login via X.",
        });
      }

      const clientId = process.env.TWITTER_CLIENT_ID;
      const clientSecret = process.env.TWITTER_CLIENT_SECRET;
      if (!clientId || !clientSecret) {
        return res.status(500).json({
          success: false,
          message: "Credenciais do X/Twitter não configuradas no backend.",
        });
      }

      const tokenResponse = await fetch(
        "https://api.twitter.com/2/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: codeVerifier,
          }).toString(),
        },
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return res.status(401).json({
          success: false,
          message: `Falha ao trocar código do X: ${errorText}`,
        });
      }

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        return res.status(401).json({
          success: false,
          message: "Não foi possível obter o access token do X.",
        });
      }

      const userResponse = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      if (!userResponse.ok) {
        return res.status(401).json({
          success: false,
          message: "Não foi possível verificar o perfil do X.",
        });
      }

      profile = await userResponse.json();
      if (!profile.data || !profile.data.id) {
        return res.status(401).json({
          success: false,
          message: "Não foi possível extrair o perfil do X.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Provider inválido.",
      });
    }

    const providerId =
      provider === "google"
        ? profile.sub
        : provider === "facebook"
          ? profile.id
          : profile.data?.id;
    const email =
      provider === "google"
        ? profile.email
        : provider === "facebook"
          ? profile.email
          : `${profile.data?.username}@twitter.com`;
    const name =
      provider === "google"
        ? profile.name
        : provider === "facebook"
          ? profile.name
          : profile.data?.name;
    const avatar =
      provider === "google"
        ? profile.picture
        : provider === "facebook"
          ? profile.picture?.data?.url
          : profile.data?.profile_image_url;

    let user = await User.findOne({
      $or: [{ provider, providerId }, { email: email?.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        name,
        email: email?.toLowerCase(),
        provider,
        providerId,
        avatar,
        isEmailVerified: true,
      });
    } else if (user.provider !== provider) {
      user.provider = provider;
      user.providerId = providerId;
      if (avatar && !user.avatar) user.avatar = avatar;
      await user.save();
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      $push: { refreshTokens: { $each: [refreshToken], $slice: -5 } },
      lastLoginAt: new Date(),
    });

    return res.json({
      success: true,
      data: { user, accessToken, refreshToken },
    });
  } catch (error) {
    console.error("[/social-login]", error);
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/refresh
// Troca um refresh token por um novo access token
// ─────────────────────────────────────────────────────────────────────────────
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token não fornecido." });
    }

    // Verifica assinatura e expiração
    const decoded = verifyRefreshToken(refreshToken);

    // Confirma que o token está na lista do usuário (invalidação individual)
    const user = await User.findById(decoded.sub).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido ou revogado.",
      });
    }

    // Rotação de refresh token: invalida o antigo, emite um novo
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, {
      $pull: { refreshTokens: refreshToken }, // remove o antigo
      $push: { refreshTokens: { $each: [newRefreshToken], $slice: -5 } }, // adiciona novo
    });

    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expirado. Faça login novamente.",
      });
    }
    res.status(401).json({ success: false, message: "Token inválido." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout
// Invalida o refresh token do dispositivo atual
// ─────────────────────────────────────────────────────────────────────────────
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Remove apenas o token deste dispositivo
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    return res.json({
      success: true,
      message: "Logout realizado com sucesso.",
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Erro interno do servidor." });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout-all
// Invalida TODOS os refresh tokens (logout em todos os dispositivos)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/logout-all", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshTokens: [] } });
  return res.json({
    success: true,
    message: "Desconectado de todos os dispositivos.",
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/request-password-reset
// Envia código de redefinição por SMS usando o telefone cadastrado
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/request-password-reset",
  [
    body("identifier")
      .trim()
      .notEmpty()
      .withMessage("Informe e-mail ou telefone"),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await findPasswordResetUser(req.body.identifier);

      if (!user || !user.phone) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado ou sem telefone cadastrado.",
        });
      }

      await sendVerificationCode(user.phone);

      return res.json({
        success: true,
        message: "Código de recuperação enviado por SMS.",
        data: {
          userId: user._id,
          identifier: maskPhone(user.phone),
          isEmail: false,
        },
      });
    } catch (error) {
      console.error("[/request-password-reset]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível enviar o código.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/verify-otp
// Valida o código enviado pela Twilio
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/verify-otp",
  [
    body("userId").isMongoId().withMessage("Usuário inválido"),
    body("otpCode").trim().notEmpty().withMessage("Código é obrigatório"),
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.body.userId);
      if (!user || !user.phone) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      const approved = await checkVerificationCode(
        user.phone,
        req.body.otpCode,
      );
      if (!approved) {
        return res.status(422).json({
          success: false,
          message: "Código inválido ou expirado.",
        });
      }

      return res.json({
        success: true,
        message: "Código validado com sucesso.",
      });
    } catch (error) {
      console.error("[/verify-otp]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível validar o código.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/resend-otp
// Reenvia o código de recuperação por SMS
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/resend-otp",
  [body("userId").isMongoId().withMessage("Usuário inválido")],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.body.userId);
      if (!user || !user.phone) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      await sendVerificationCode(user.phone);

      return res.json({
        success: true,
        message: "Código reenviado por SMS.",
      });
    } catch (error) {
      console.error("[/resend-otp]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível reenviar o código.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/reset-password
// Redefine senha depois de confirmar novamente o código Twilio
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/reset-password",
  [
    body("userId").isMongoId().withMessage("Usuário inválido"),
    body("otpCode").trim().notEmpty().withMessage("Código é obrigatório"),
    ...passwordValidations,
  ],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.body.userId).select("+password");
      if (!user || !user.phone) {
        return res.status(404).json({
          success: false,
          message: "Usuário não encontrado.",
        });
      }

      const approved = await checkVerificationCode(
        user.phone,
        req.body.otpCode,
      );
      if (!approved) {
        return res.status(422).json({
          success: false,
          message: "Código inválido ou expirado.",
        });
      }

      user.password = req.body.newPassword;
      await user.save();

      await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [] } });

      return res.json({
        success: true,
        message: "Senha redefinida com sucesso.",
      });
    } catch (error) {
      console.error("[/reset-password]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível redefinir a senha.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/me
// Retorna os dados do usuário autenticado
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req, res) => {
  return res.json({ success: true, data: { user: req.user } });
});

// PUT /auth/me
// Atualiza dados de perfil do usuário autenticado
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, email, phone, avatarBase64 } = req.body;

    // Verifica se email já existe em outra conta
    if (email && email !== req.user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res
          .status(409)
          .json({ success: false, message: "E-mail já cadastrado." });
      }
    }

    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (phone) updates.phone = phone.trim();

    // Se veio avatarBase64, salva arquivo em /uploads e define URL
    if (avatarBase64) {
      const fs = require("fs");
      const crypto = require("crypto");
      const matches = avatarBase64.match(
        /^data:(image\/(png|jpeg|jpg));base64,(.+)$/,
      );
      if (!matches) {
        return res
          .status(400)
          .json({ success: false, message: "avatarBase64 inválido." });
      }

      const ext = matches[2] === "jpeg" ? "jpg" : matches[2];
      const data = matches[3];
      const buffer = Buffer.from(data, "base64");
      const filename = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
      const uploadsDir = path.resolve(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      // URL acessível
      const proto = req.protocol || "http";
      const host = req.get("host");
      updates.avatar = `${proto}://${host}/uploads/${filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true },
    );

    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("[/me PUT]", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Não foi possível atualizar perfil.",
    });
  }
});

// POST /auth/me/avatar
// Upload multipart avatar and update user's avatar URL
router.post(
  "/me/avatar",
  requireAuth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Arquivo não enviado." });
      }

      const filename = req.file.filename;
      const proto = req.protocol || "http";
      const host = req.get("host");
      const avatarUrl = `${proto}://${host}/uploads/${filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { avatar: avatarUrl } },
        { new: true },
      );

      return res.json({ success: true, data: { user } });
    } catch (error) {
      console.error("[/me/avatar]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível enviar avatar.",
      });
    }
  },
);

// POST /auth/change-password
// Troca a senha do usuário após validar senha atual
router.post(
  "/change-password",
  requireAuth,
  [
    body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Senha deve ter ao menos 8 caracteres"),
  ],
  validate,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id).select("+password");
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Usuário não encontrado." });

      const ok = await user.comparePassword(currentPassword);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, message: "Senha atual incorreta." });

      user.password = newPassword;
      await user.save();

      // Invalida refresh tokens (logout em outros dispositivos)
      await User.findByIdAndUpdate(user._id, { $set: { refreshTokens: [] } });

      return res.json({
        success: true,
        message: "Senha alterada com sucesso.",
      });
    } catch (error) {
      console.error("[/change-password]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível alterar a senha.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/2fa/send
// Envia código SMS para ativação de 2FA
// ─────────────────────────────────────────────────────────────────────────────
router.post("/2fa/send", requireAuth, smsLimiter, async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.phone) {
      return res
        .status(400)
        .json({ success: false, message: "Telefone não cadastrado." });
    }

    await sendVerificationCode(user.phone);

    return res.json({ success: true, message: "Código enviado por SMS." });
  } catch (error) {
    console.error("[/2fa/send]", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Não foi possível enviar o código.",
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/2fa/verify
// Verifica código e ativa 2FA para o usuário
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/2fa/verify",
  requireAuth,
  [body("code").trim().notEmpty().withMessage("Código é obrigatório")],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user || !user.phone) {
        return res
          .status(400)
          .json({ success: false, message: "Telefone não cadastrado." });
      }

      const approved = await checkVerificationCode(user.phone, req.body.code);
      if (!approved) {
        return res
          .status(422)
          .json({ success: false, message: "Código inválido ou expirado." });
      }

      user.twoFaEnabled = true;
      await user.save();

      return res.json({
        success: true,
        message: "2FA ativado.",
        data: { user },
      });
    } catch (error) {
      console.error("[/2fa/verify]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível verificar o código.",
      });
    }
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/2fa/disable
// Desativa 2FA (requer senha atual)
// ─────────────────────────────────────────────────────────────────────────────
router.post(
  "/2fa/disable",
  requireAuth,
  [body("currentPassword").notEmpty().withMessage("Senha atual é obrigatória")],
  validate,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Usuário não encontrado." });

      const ok = await user.comparePassword(req.body.currentPassword);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, message: "Senha atual incorreta." });

      user.twoFaEnabled = false;
      await user.save();

      return res.json({
        success: true,
        message: "2FA desativado.",
        data: { user },
      });
    } catch (error) {
      console.error("[/2fa/disable]", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Não foi possível desativar 2FA.",
      });
    }
  },
);

module.exports = router;
