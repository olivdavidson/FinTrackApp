const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────────────────────
// Gera um Access Token (curta duração — padrão 7 dias)
// Payload mínimo: apenas o ID do usuário.
// Não inclua dados sensíveis (senha, email) no payload.
// ─────────────────────────────────────────────────────────────────────────────
const generateAccessToken = (userId) => {
  return jwt.sign(
    { sub: userId }, // "sub" é a claim padrão para subject
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Gera um Refresh Token (longa duração — padrão 30 dias)
// Usado para obter um novo access token sem pedir login novamente.
// ─────────────────────────────────────────────────────────────────────────────
const generateRefreshToken = (userId) => {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Verifica e decodifica um Access Token
// ─────────────────────────────────────────────────────────────────────────────
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ─────────────────────────────────────────────────────────────────────────────
// Verifica e decodifica um Refresh Token
// ─────────────────────────────────────────────────────────────────────────────
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
