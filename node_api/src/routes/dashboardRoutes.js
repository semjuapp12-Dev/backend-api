const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// Todas as rotas do dashboard requerem autenticação e permissão de Administrador
// GET /api/dashboard/summary

// ...
// GET /api/dashboard/stats (Adicionar esta linha)
router.get('/stats', requireAuth, requirePermission(['administrador']), dashboardController.getStats);

// GET /api/dashboard/summary (Manter esta linha)
router.get('/summary', requireAuth, requirePermission(['administrador']), dashboardController.getSummary);
// ...


module.exports = router;
