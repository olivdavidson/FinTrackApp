const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const authMechanism = process.env.MONGODB_AUTH_MECHANISM;
    const useAwsIam = authMechanism === "MONGODB-AWS";
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    if (useAwsIam) {
      options.authMechanism = "MONGODB-AWS";
      options.authSource = "$external";
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    if (useAwsIam) {
      console.log("✅ MongoDB autenticado com AWS IAM Roles.");
    }

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB desconectado. Tentando reconectar...");
    });
    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconectado.");
    });
  } catch (error) {
    console.error("❌ Erro ao conectar no MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
