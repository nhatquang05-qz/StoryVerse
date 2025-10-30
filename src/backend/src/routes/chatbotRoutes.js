const express = require('express');
const router = express.Router();
const { askChatbot } = require('../controllers/chatbotController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/chatbot/ask', authenticateToken, askChatbot);

module.exports = router;