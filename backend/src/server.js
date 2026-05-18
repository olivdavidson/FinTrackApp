const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const dataRoutes = require("./routes/data");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "FinTrack backend ativo." });
});

app.use("/auth", authRoutes);
app.use("/data", dataRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Erro ao iniciar backend:", error);
    process.exit(1);
  });
