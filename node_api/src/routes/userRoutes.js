const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// ------------------------------------------------------------------
// 🔹 RANKING (PÚBLICO)
// ------------------------------------------------------------------

// GET /api/users/ranking/top3
router.get('/ranking/top3', userController.getTop3Ranking);

// ------------------------------------------------------------------
// 🔹 MINHA POSIÇÃO NO RANKING  (USUÁRIO LOGADO)
// ------------------------------------------------------------------

// GET /api/users/ranking/me
router.get('/ranking/me', requireAuth, userController.getMyRankingPosition);

// ------------------------------------------------------------------
// 🔔 EVENTOS LEMBRADOS (USUÁRIO LOGADO)
// ------------------------------------------------------------------

// Toggle evento lembrado
router.post('/eventos/:eventoId/lembrar', requireAuth, userController.toggleEventoLembrado);

// Listar eventos lembrados
router.get('/eventos/lembrados', requireAuth, userController.listarEventosLembrados);

// ------------------------------------------------------------------
// 🔔 CURSOS LEMBRADOS (USUÁRIO LOGADO)
// ------------------------------------------------------------------

// Toggle curso lembrado
router.post('/cursos/:cursoId/lembrar', requireAuth, userController.toggleCursoLembrado);

// Listar cursos lembrados
router.get('/cursos/lembrados', requireAuth, userController.listarCursosLembrados);



// ------------------------------------------------------------------
// 🔔 HISTÓRICO DE CHECK-INS (USUÁRIO LOGADO)
// ------------------------------------------------------------------

// Listar check-ins do usuário
router.get('/checkins', requireAuth, userController.listarCheckins);


// ------------------------------------------------------------------
// 🔔 OPORTUNIDADES LEMBRADAS (USUÁRIO LOGADO)
// ------------------------------------------------------------------

// Toggle oportunidade lembrada
router.post('/oportunidades/:oportunidadeId/lembrar', requireAuth, userController.toggleOportunidadeLembrada);

// Listar oportunidades lembradas
router.get('/oportunidades/lembradas', requireAuth, userController.listarOportunidadesLembradas);



// ------------------------------------------------------------------
// ❤️ LIKES (USUÁRIO LOGADO)
// ------------------------------------------------------------------


// GET /api/users/me/likes
router.get('/me/likes', requireAuth, userController.getMyLikes);

// Toggle like (evento | curso | oportunidade)
router.post(
  '/like/:tipo/:id',
  requireAuth,
  userController.toggleLike
);



// ------------------------------------------------------------------
// 🔹 PRIVADO (ADMIN)
// ------------------------------------------------------------------

// Todas as rotas de gerenciamento de usuários requerem autenticação e permissão de Administrador

// [GET] /api/users - Listar todos os usuários
router.get('/', requireAuth, requirePermission(['administrador']), userController.listUsers);

// [GET] /api/users/:id - Obter usuário por ID
router.get('/:id', requireAuth, requirePermission(['administrador']), userController.getUserById);

// [PUT] /api/users/:id - Atualizar usuário
router.put('/:id', requireAuth, requirePermission(['administrador']), userController.updateUser);

// [DELETE] /api/users/:id - Deletar usuário
router.delete('/:id', requireAuth, requirePermission(['administrador']), userController.deleteUser);

module.exports = router;
