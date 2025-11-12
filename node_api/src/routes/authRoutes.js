const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/auth');

// Rota de Registro de Novo Usuário
// POST /api/auth/register
router.post('/register', authController.register);

// Rota de Login de Usuário
// POST /api/auth/login
router.post('/login', authController.login);

// Rota Protegida de Exemplo (requer token JWT válido)
// GET /api/auth/me
router.get('/me', requireAuth, authController.me);

module.exports = router;
