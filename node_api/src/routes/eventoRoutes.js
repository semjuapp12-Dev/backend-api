const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// Rotas de Leitura (GET) - Acesso Público
// GET /api/content/eventos
router.get('/', eventoController.listEventos); 
// GET /api/content/eventos/:id
router.get('/:id', eventoController.getEventoById); 

// Rotas de Gerenciamento (Requerem Autenticação e Permissão)
// POST /api/content/eventos
router.post('/', requireAuth, requirePermission(['administrador', 'editor']), eventoController.upload.single('imagem'), eventoController.createEvento);
// PUT /api/content/eventos/:id
router.put('/:id', requireAuth, requirePermission(['administrador', 'editor']), eventoController.upload.single('imagem'), eventoController.updateEvento); 
// DELETE /api/content/eventos/:id
router.delete('/:id', requireAuth, requirePermission(['administrador', 'editor']), eventoController.deleteEvento); 

module.exports = router;
