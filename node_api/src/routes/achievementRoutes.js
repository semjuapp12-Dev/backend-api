const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// Rotas de Leitura (Acesso público ou autenticado para ver todas as públicas)
// GET /api/achievements
router.get('/', achievementController.listAchievements);

// Rotas de Gerenciamento (Apenas Admin)

// [POST] /api/achievements - Criar nova conquista
router.post('/', requireAuth, requirePermission(['administrador']), achievementController.createAchievement);

// [PUT] /api/achievements/:id - Atualizar conquista
router.put('/:id', requireAuth, requirePermission(['administrador']), achievementController.updateAchievement);

// [DELETE] /api/achievements/:id - Deletar conquista
router.delete('/:id', requireAuth, requirePermission(['administrador']), achievementController.deleteAchievement);

module.exports = router;
