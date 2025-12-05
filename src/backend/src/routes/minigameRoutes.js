const express = require('express');
const router = express.Router();
const minigameController = require('../controllers/minigameController');
const { authenticateToken } = require('../middleware/authMiddleware'); 

router.post('/spin', authenticateToken, minigameController.spin);
router.post('/wish', authenticateToken, minigameController.postWish);
router.get('/wishes', minigameController.getWishList);
router.get('/info', authenticateToken, minigameController.getInfo);

module.exports = router;