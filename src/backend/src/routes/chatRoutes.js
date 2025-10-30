// src/backend/src/routes/chatRoutes.js (ĐÃ SỬA LỖI)

const express = require('express');
const router = express.Router();
const { getGlobalMessages, getChapterMessages, postMessage, toggleLikeMessage } = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

// FIX: Bỏ /chat ở đầu các route
router.get('/global', getGlobalMessages);
router.get('/chapter/:comicId/:chapterId', getChapterMessages);
router.post('/message', authenticateToken, postMessage);
router.post('/like/:messageId', authenticateToken, toggleLikeMessage);

module.exports = router;