const express = require('express');
const router = express.Router();
const { getGlobalMessages, getChapterMessages, postMessage, toggleLikeMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/global', getGlobalMessages);
router.get('/chapter/:comicId/:chapterId', getChapterMessages);
router.post('/message', authenticateToken, postMessage);
router.post('/like/:messageId', authenticateToken, toggleLikeMessage);

module.exports = router;