const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// Todas as rotas de gerenciamento de usuários requerem autenticação e permissão de Administrador

// [GET] /api/users - Listar todos os usuários
router.get('/', requireAuth, requirePermission(['administrador']), userController.listUsers);

// [GET] /api/users/:id - Obter usuário por ID
router.get('/:id', requireAuth, requirePermission(['administrador']), userController.getUserById);

// [PUT] /api/users/:id - Atualizar usuário (Ex: mudar nível de acesso, bloquear)
router.put('/:id', requireAuth, requirePermission(['administrador']), userController.updateUser);

// [DELETE] /api/users/:id - Deletar usuário
router.delete('/:id', requireAuth, requirePermission(['administrador']), userController.deleteUser);

module.exports = router;
