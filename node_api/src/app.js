const express = require("express");
const passport = require("passport");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");

// Importação das rotas
const cursoRoutes = require("./routes/cursoRoutes");
const eventoRoutes = require("./routes/eventoRoutes");
const oportunidadeRoutes = require("./routes/oportunidadeRoutes");
const authRoutes = require("./routes/authRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// -----------------------------------------------------------------------------
// 🔐 Middlewares de Segurança (Helmet CORRIGIDO para uploads cross-origin)
// -----------------------------------------------------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// -----------------------------------------------------------------------------
// 🌐 CORS (liberado para desenvolvimento)
// -----------------------------------------------------------------------------
app.use(cors());

// -----------------------------------------------------------------------------
// 📦 Parsers
// -----------------------------------------------------------------------------
app.use(express.json());

// -----------------------------------------------------------------------------
// 🖼️ Arquivos estáticos (uploads) — ESSENCIAL PARA IMAGENS NO FRONTEND
// -----------------------------------------------------------------------------
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// -----------------------------------------------------------------------------
// 📝 Log de requisições (debug)
// -----------------------------------------------------------------------------
app.use((req, res, next) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }

  next();
});

// -----------------------------------------------------------------------------
// 🔑 Passport
// -----------------------------------------------------------------------------
app.use(passport.initialize());
require("./config/passport")(passport);
require("./middlewares/auth");

// -----------------------------------------------------------------------------
// 🗄️ Banco de dados
// -----------------------------------------------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB conectado com sucesso!"))
  .catch((err) =>
    console.error("Erro de conexão com o MongoDB:", err.message)
  );

// -----------------------------------------------------------------------------
// 🧪 Rota base
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Bem-vindo à API da VOE+!",
    status: "online",
    environment: process.env.NODE_ENV,
  });
});

// -----------------------------------------------------------------------------
// 🚦 Rotas
// -----------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Conteúdos
app.use("/api/content/cursos", cursoRoutes);
app.use("/api/content/eventos", eventoRoutes);
app.use("/api/content/oportunidades", oportunidadeRoutes);

// -----------------------------------------------------------------------------
// ❌ Tratamento de erros
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("ERRO NO SERVIDOR:", err);

  res.status(500).json({
    error: "Erro interno do servidor",
    details: err.message,
  });
});

// -----------------------------------------------------------------------------
// 🚀 Inicialização do servidor
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log("Aguardando requisições...");
});
