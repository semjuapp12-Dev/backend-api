const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { requireAuth } = require('../middlewares/auth');
const requirePermission = require('../middlewares/requirePermission'); // Import adicionado

// [POST] /api/comments - Criar novo comentário
router.post('/', requireAuth, commentController.createComment);

// [GET] /api/comments/:contentId - Listar comentários de um conteúdo
router.get('/:contentId', commentController.listComments);

// [GET] /api/comments/moderation - Listar comentários denunciados
router.get(
  '/moderation',
  requireAuth,
  requirePermission(['administrador', 'moderador']),
  commentController.listReportedComments
);

// [PUT] /api/comments/:id/moderate - Moderação de comentário
router.put(
  '/:id/moderate',
  requireAuth,
  requirePermission(['administrador', 'moderador']),
  commentController.moderateComment
);

// [DELETE] /api/comments/:id - Deletar comentário
router.delete('/:id', requireAuth, commentController.deleteComment);

// [POST] /api/comments/:id/report - Denunciar comentário
router.post('/:id/report', requireAuth, commentController.reportComment);

module.exports = router;
