const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/top-contributors', communityController.getTopContributors);
router.get('/suggested-comics', communityController.getSuggestedComics);
router.get('/my-stats', authenticateToken, communityController.getUserCommunityStats);

module.exports = router;