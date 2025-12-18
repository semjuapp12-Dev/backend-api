const express = require('express');
const router = express.Router();
const oportunidadeController = require('../controllers/oportunidadeController');
const passport = require('passport'); // Usamos o passport configurado anteriormente

// --- ROTAS PÚBLICAS (Qualquer um vê) ---

// GET /api/content/oportunidades -> Lista todas
router.get('/', oportunidadeController.listOportunidades); 

// GET /api/content/oportunidades/:id -> Detalhes de uma oportunidade
router.get('/:id', oportunidadeController.getOportunidadeById); 


// --- ROTAS PROTEGIDAS (Precisa de Login) ---

// POST /api/content/oportunidades -> Criar oportunidade
router.post(
  '/', 
  passport.authenticate('jwt', { session: false }), 
  oportunidadeController.upload?.single ? oportunidadeController.upload.single('imagem') : (req, res, next) => next(),
  oportunidadeController.createOportunidade
); 

// PUT /api/content/oportunidades/:id -> Atualizar oportunidade
router.put(
  '/:id', 
  passport.authenticate('jwt', { session: false }), 
  oportunidadeController.upload?.single ? oportunidadeController.upload.single('imagem') : (req, res, next) => next(),
  oportunidadeController.updateOportunidade
); 

// DELETE /api/content/oportunidades/:id -> Deletar oportunidade
router.delete(
  '/:id', 
  passport.authenticate('jwt', { session: false }), 
  oportunidadeController.deleteOportunidade
); 

// PUT /api/content/oportunidades/:id/highlight -> Alternar destaque (opcional)
router.put(
  '/:id/highlight', 
  passport.authenticate('jwt', { session: false }), 
  oportunidadeController.toggleHighlight
); 

module.exports = router;
