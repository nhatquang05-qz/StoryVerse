const express = require('express');
const router = express.Router();
const { getGlobalMessages, getChapterMessages, postMessage, toggleLikeMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/chat/global', getGlobalMessages);
router.get('/chat/chapter/:comicId/:chapterId', getChapterMessages);
router.post('/chat/message', authenticateToken, postMessage);
router.post('/chat/like/:messageId', authenticateToken, toggleLikeMessage);

module.exports = router;