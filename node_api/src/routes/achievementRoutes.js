const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { requireAuth, requirePermission } = require('../middlewares/auth');

// GET /api/achievements
router.get('/', achievementController.listAchievements);

// GET /api/achievements/:id
router.get(
  '/:id',
  requireAuth,
  requirePermission(['administrador']),
  achievementController.getAchievementById
);


// POST /api/achievements (com imagem)
router.post(
    '/',
    requireAuth,
    requirePermission(['administrador']),
    achievementController.upload.single('imagem'),
    achievementController.createAchievement
);

// PUT /api/achievements/:id (com imagem)
router.put(
    '/:id',
    requireAuth,
    requirePermission(['administrador']),
    achievementController.upload.single('imagem'),
    achievementController.updateAchievement
);

// DELETE /api/achievements/:id
router.delete(
    '/:id',
    requireAuth,
    requirePermission(['administrador']),
    achievementController.deleteAchievement
);

module.exports = router;
