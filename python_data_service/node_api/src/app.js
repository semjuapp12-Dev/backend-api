// src/app.js
const express = require('express');
const passport = require('passport'); // Adicionado
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middlewares de Segurança e Utilitários ---
app.use(helmet());
app.use(cors());
app.use(express.json()); // Para parsear application/json
app.use(passport.initialize()); // Adicionado

// --- Configuração de Autenticação (Importa a estratégia JWT) ---
require('./middlewares/auth'); // Apenas importa para configurar o passport

// --- Conexão com o Banco de Dados ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => {
    console.error('Erro de conexão com o MongoDB:', err.message);
    process.exit(1); // Encerra a aplicação em caso de erro de conexão
  });

// --- Rotas de Exemplo ---
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bem-vindo à API do Hub da Juventude!',
    status: 'online',
    environment: process.env.NODE_ENV
  });
});

// --- Importação e Uso de Rotas ---
const contentRoutes = require('./routes/contentRoutes'); // Adicionado
const authRoutes = require('./routes/authRoutes'); // <<<< ESTA LINHA SERÁ ADICIONADA
app.use('/api/content', contentRoutes); // Adicionado
app.use('/api/auth', authRoutes); // Adicionado
// app.use('/api/users', userRoutes);

// --- Tratamento de Erros (Middleware final) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT} (${process.env.NODE_ENV})`);
});
