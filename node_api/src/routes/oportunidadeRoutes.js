const express = require('express');
const router = express.Router();
const oportunidadeController = require('../controllers/oportunidadeController');
const passport = require('passport'); // Usamos o passport configurado anteriormente

// --- ROTAS PÚBLICAS (Qualquer um vê) ---

// GET /api/content/oportunidades
router.get('/', oportunidadeController.listOportunidades); 

// GET /api/content/oportunidades/:id
router.get('/:id', oportunidadeController.getOportunidadeById); 


// --- ROTAS PROTEGIDAS (Precisa de Login) ---
// Substituí o 'requireAuth' pelo 'passport.authenticate' para manter o padrão que funciona

// POST /api/content/oportunidades
router.post('/', passport.authenticate('jwt', { session: false }), oportunidadeController.createOportunidade); 

// PUT /api/content/oportunidades/:id
router.put('/:id', passport.authenticate('jwt', { session: false }), oportunidadeController.updateOportunidade); 

// DELETE /api/content/oportunidades/:id
router.delete('/:id', passport.authenticate('jwt', { session: false }), oportunidadeController.deleteOportunidade); 

module.exports = router;