const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fintrack_dev_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fintrack_dev_refresh_secret";

if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.warn(
    "⚠️ JWT_SECRET ou JWT_REFRESH_SECRET não definido. Usando segredos de desenvolvimento.",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gera um Access Token (curta duração — padrão 7 dias)
// Payload mínimo: apenas o ID do usuário.
// Não inclua dados sensíveis (senha, email) no payload.
// ─────────────────────────────────────────────────────────────────────────────
const generateAccessToken = (userId) => {
  return jwt.sign(
    { sub: userId }, // "sub" é a claim padrão para subject
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Gera um Refresh Token (longa duração — padrão 30 dias)
// Usado para obter um novo access token sem pedir login novamente.
// ─────────────────────────────────────────────────────────────────────────────
const generateRefreshToken = (userId) => {
  return jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Verifica e decodifica um Access Token
// ─────────────────────────────────────────────────────────────────────────────
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// ─────────────────────────────────────────────────────────────────────────────
// Verifica e decodifica um Refresh Token
// ─────────────────────────────────────────────────────────────────────────────
const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
