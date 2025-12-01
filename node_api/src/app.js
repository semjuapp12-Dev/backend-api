const express = require('express');
const passport = require('passport');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

// Importação das rotas
const cursoRoutes = require('./routes/cursoRoutes'); 
const eventoRoutes = require('./routes/eventoRoutes'); 
const oportunidadeRoutes = require('./routes/oportunidadeRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const commentRoutes = require('./routes/commentRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const achievementRoutes = require('./routes/achievementRoutes'); 
const dashboardRoutes = require('./routes/dashboardRoutes'); 

// Carrega variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middlewares de Segurança e Utilitários ---
app.use(helmet());

// --- CONFIGURAÇÃO DE CORS SIMPLIFICADA (Correção) ---
// Em desenvolvimento, isso permite que qualquer origem (3000, 3001, 5173, mobile) acesse a API.
// Isso elimina erros de bloqueio de porta cruzada.
app.use(cors()); 

app.use(express.json()); // Para parsear application/json

// --- LOG DE REQUISIÇÕES ---
// Isso vai nos dizer se a requisição está chegando no servidor
app.use((req, res, next) => {
  console.log(`\n[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// --- Configuração do Passport ---
app.use(passport.initialize()); 

// 1. Carrega a estratégia LOCAL
require('./config/passport')(passport); 

// 2. Carrega a configuração da estratégia JWT
require('./middlewares/auth'); 

// --- Conexão com o Banco de Dados ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => {
    console.error('Erro de conexão com o MongoDB:', err.message);
    // Não encerra o processo para você poder ver o erro no terminal sem cair
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
app.use('/api/auth', authRoutes); 
app.use('/api/comments', commentRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/achievements', achievementRoutes); 
app.use('/api/dashboard', dashboardRoutes); 

// Rotas Específicas de Conteúdo
app.use('/api/content/cursos', cursoRoutes); 
app.use('/api/content/eventos', eventoRoutes); 
app.use('/api/content/oportunidades', oportunidadeRoutes); 

// --- Tratamento de Erros (Middleware final) ---
app.use((err, req, res, next) => {
  console.error('ERRO NO SERVIDOR:', err); // Log detalhado do erro
  res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: err.message 
  });
});

// --- Inicialização do Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Aguardando requisições...');
});