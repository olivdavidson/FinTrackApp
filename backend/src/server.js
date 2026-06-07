const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet"); // 🔒 Segurança: headers HTTP
const rateLimit = require("express-rate-limit"); // 🚦 Previne ataques de força bruta
const compression = require("compression"); // 📦 Compressão para performance
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

// Carrega variáveis de ambiente corretamente
const envPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../.env.production")
    : path.resolve(__dirname, "../.env");

const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.warn(
    `⚠️ Variáveis de ambiente não foram carregadas de ${envPath}. Crie um arquivo .env em backend/ ou exporte as variáveis no ambiente.`,
  );
}

const app = express();
const PORT = process.env.PORT || 4000;

// ========================
// 🔒 CONFIGURAÇÕES DE SEGURANÇA
// ========================

// Helmet: protege contra vulnerabilidades conhecidas
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permite uploads
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
  }),
);

// Rate limiting: protege endpoints críticos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 tentativas
  message: { error: "Muitas tentativas. Tente novamente em 15 minutos." },
  standardHeaders: true, // Retorna rate limit info nos headers
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
});

// Rate limit geral (mais brando)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: { error: "Muitas requisições. Aguarde um momento." },
});

// ========================
// 🌐 CONFIGURAÇÃO DO CORS (CRÍTICO PARA SEGURANÇA)
// ========================

// Lista de origens permitidas (IMPORTANTE para produção)
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://seu-app-expo.onrender.com", // Seu app web (se existir)
        "exp://", // Expo Go
        "http://localhost:19000", // Desenvolvimento local
        "http://localhost:19001",
        "http://localhost:19002",
      ]
    : ["*"]; // Em desenvolvimento, permite tudo (mas só local)

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite requisições sem origin (como mobile apps)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === "production") {
        if (
          allowedOrigins.indexOf(origin) !== -1 ||
          origin.startsWith("exp://")
        ) {
          callback(null, true);
        } else {
          console.warn(`🚫 CORS bloqueado para origem: ${origin}`);
          callback(new Error("Não permitido por CORS"));
        }
      } else {
        callback(null, true);
      }
    },
    credentials: true, // Permite cookies/headers de autenticação
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: [
      "X-Total-Count",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
    ],
    maxAge: 86400, // Cache do preflight por 24h
  }),
);

// ========================
// 📦 MIDDLEWARES DE PERFORMANCE
// ========================

app.use(compression()); // Compressão GZIP
app.use(express.json({ limit: "10mb" })); // Limite de payload
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging (apenas erros em produção, completo em desenvolvimento)
if (process.env.NODE_ENV !== "production") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
} else {
  // Log mínimo para produção (apenas erros)
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Aplica rate limiting global
app.use("/api/", globalLimiter);
app.use("/auth/", authLimiter); // Proteção extra para autenticação

// ========================
// 📁 SERVING DE ARQUIVOS ESTÁTICOS COM SEGURANÇA
// ========================

// Sanitiza path para prevenir path traversal
const sanitizePath = (req, res, next) => {
  if (req.path.includes("..")) {
    return res.status(403).json({ error: "Caminho inválido" });
  }
  next();
};

app.use(
  "/uploads",
  sanitizePath,
  express.static(path.resolve(__dirname, "../uploads"), {
    maxAge: "7d", // Cache por 7 dias
    etag: true,
    lastModified: true,
  }),
);

// ========================
// 🏥 HEALTH CHECK (útil para o Render)
// ========================

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinTrack backend ativo.",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

// ========================
// 🗺️ ROTAS DA APLICAÇÃO
// ========================

app.use("/auth", authRoutes);
app.use("/data", dataRoutes);

// ========================
// ❌ TRATAMENTO DE ERROS (Middleware final)
// ========================

// Rota 404 para endpoints não encontrados
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.originalUrl,
  });
});

// Middleware global de erro (captura erros lançados em qualquer lugar)
app.use((err, req, res, next) => {
  console.error("❌ Erro:", err.stack);

  // Tratamento específico por tipo de erro
  if (err.name === "ValidationError") {
    return res
      .status(400)
      .json({ error: "Dados inválidos", details: err.message });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Não autorizado" });
  }

  if (err.message === "Não permitido por CORS") {
    return res.status(403).json({ error: err.message });
  }

  // Erro genérico (sem expor detalhes em produção)
  const message =
    process.env.NODE_ENV === "production"
      ? "Erro interno do servidor"
      : err.message;

  res.status(err.status || 500).json({
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ========================
// 🚀 INICIALIZAÇÃO DO SERVIDOR
// ========================

let mongoose; // Import dinâmico para evitar erro se não usado

connectDB()
  .then((mongooseConnection) => {
    mongoose = mongooseConnection;

    app.listen(PORT, "0.0.0.0", () => {
      // '0.0.0.0' é essencial para o Render
      console.log(
        `🚀 Backend rodando em ${process.env.NODE_ENV || "development"} mode`,
      );
      console.log(`📡 Porta: ${PORT}`);
      console.log(`🔗 URL local: http://localhost:${PORT}`);
      if (process.env.NODE_ENV === "production") {
        console.log(`🌍 URL pública: ${process.env.RENDER_EXTERNAL_URL}`);
      }
    });
  })
  .catch((error) => {
    console.error("❌ Erro ao iniciar backend:", error);
    process.exit(1);
  });

// Graceful shutdown (encerramento limpo)
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM recebido. Encerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor encerrado");
    mongoose?.connection.close();
  });
});
