const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    bank: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
      default: "Conta principal",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    icon: {
      type: String,
      default: "cash",
    },
    iconColor: {
      type: String,
      default: "#4AE1C8",
    },
    iconBg: {
      type: String,
      default: "rgba(74,225,200,0.15)",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.user;
        return ret;
      },
    },
  },
);

accountSchema.index({ user: 1, isDefault: 1 });

const Account = mongoose.model("Account", accountSchema);
module.exports = Account;
