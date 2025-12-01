const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const passport = require('passport'); // Usamos o passport configurado no projeto

// --- ROTAS PÚBLICAS (Qualquer um pode ver) ---

// GET /api/content/cursos -> Lista todos
router.get('/', cursoController.listCursos); 

// GET /api/content/cursos/:id -> Detalhes de um curso
router.get('/:id', cursoController.getCursoById); 


// --- ROTAS PROTEGIDAS (Precisa estar logado) ---
// Adaptado para usar a autenticação JWT padrão do projeto

// POST /api/content/cursos -> Criar curso
router.post('/', passport.authenticate('jwt', { session: false }), cursoController.createCurso); 

// PUT /api/content/cursos/:id -> Atualizar curso
router.put('/:id', passport.authenticate('jwt', { session: false }), cursoController.updateCurso); 

// DELETE /api/content/cursos/:id -> Deletar curso
router.delete('/:id', passport.authenticate('jwt', { session: false }), cursoController.deleteCurso); 

// PUT /api/content/cursos/:id/highlight -> Alternar destaque
router.put('/:id/highlight', passport.authenticate('jwt', { session: false }), cursoController.toggleHighlight); 

module.exports = router;