const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────────────────────────────────────
// Schema do usuário
// A SENHA NUNCA é armazenada em texto puro.
// O campo `password` recebe o hash bcrypt antes de ser salvo.
// ─────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      minlength: [2, "Nome deve ter ao menos 2 caracteres"],
      maxlength: [80, "Nome deve ter no máximo 80 caracteres"],
    },

    email: {
      type: String,
      required: [true, "E-mail é obrigatório"],
      unique: true, // índice único no MongoDB
      lowercase: true, // normaliza antes de salvar
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de e-mail inválido"],
    },

    // ── Senha (hash bcrypt, nunca plain-text) ──────────────────────────────
    password: {
      type: String,
      minlength: [8, "Senha deve ter ao menos 8 caracteres"],
      select: false, // NUNCA retorna a senha em queries normais
    },

    // ── Login Social ────────────────────────────────────────────────────────
    // Usuários que entram via Google/Facebook/X não têm senha local;
    // identificamos por provider + providerId.
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "x"],
      default: "local",
    },
    providerId: {
      type: String,
      default: null,
    },

    // ── Perfil ───────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },

    // ── Segurança ─────────────────────────────────────────────────────────
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // ── Tokens de refresh (lista para suportar múltiplos dispositivos) ─────
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },

    // ── Controle de acesso ─────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adiciona createdAt e updatedAt automaticamente
    toJSON: {
      // Remove campos sensíveis ao serializar
      transform(_, ret) {
        delete ret.__v;
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        return ret;
      },
    },
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Middleware: hash da senha ANTES de salvar
// Só executa se o campo `password` foi modificado
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  // Custo 12: boa relação segurança/performance (padrão recomendado em 2024)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// Método de instância: compara senha digitada com o hash salvo
// ─────────────────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  // `this.password` pode estar undefined se não foi selecionado na query.
  // Use sempre `.select('+password')` quando precisar verificar.
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────────────────────────────────────
// Índices
// ─────────────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }); // busca por email
userSchema.index({ provider: 1, providerId: 1 }); // login social

const User = mongoose.model("User", userSchema);
module.exports = User;
