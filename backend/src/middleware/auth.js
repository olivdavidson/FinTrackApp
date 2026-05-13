const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: protege rotas que exigem autenticação
// Extrai o JWT do header Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────────────────────
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token de autenticação não fornecido.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    // Busca o usuário para garantir que ainda existe e está ativo
    const user = await User.findById(decoded.sub).select(
      "-password -refreshTokens",
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Usuário não encontrado." });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Conta desativada." });
    }

    req.user = user; // disponibiliza o usuário nas rotas seguintes
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token expirado. Faça login novamente.",
        });
    }
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Token inválido." });
    }
    next(error);
  }
};

module.exports = { requireAuth };
