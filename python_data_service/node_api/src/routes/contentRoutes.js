const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// Rotas de Leitura (Acesso Público ou Autenticado para interações futuras)
// Por enquanto, vamos deixar a leitura aberta para simular o feed público
// GET /api/content
router.get('/', contentController.listContent);
// GET /api/content/:id
router.get('/:id', contentController.getContentById);

// Rotas Protegidas (Requerem Autenticação)

// Rota de Criação (Requer Admin ou Editor)
// POST /api/content
router.post('/', requireAuth, requirePermission(['administrador', 'editor']), contentController.createContent);

// Rota de Atualização (Requer Admin, Editor ou Autor do Conteúdo)
// PUT /api/content/:id
router.put('/:id', requireAuth, contentController.updateContent); // A permissão mais fina é verificada dentro do controller

// Rota de Exclusão (Requer Admin, Editor ou Autor do Conteúdo)
// DELETE /api/content/:id
router.delete('/:id', requireAuth, contentController.deleteContent); // A permissão mais fina é verificada dentro do controller

module.exports = router;
