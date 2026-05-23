const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
    icon: {
      type: String,
      required: true,
      default: "cash",
    },
    color: {
      type: String,
      required: true,
      default: "#4AE1C8",
    },
    colorBg: {
      type: String,
      required: true,
      default: "rgba(74,225,200,0.15)",
    },
    budget: {
      type: Number,
      default: 0,
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

categorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
