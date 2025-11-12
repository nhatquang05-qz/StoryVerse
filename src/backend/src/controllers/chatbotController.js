const chatbotService = require('../services/chatbotService');

const askChatbot = async (req, res) => {
    try {
        const { message, history } = req.body;
        const { userId } = req;

        const result = await chatbotService.askChatbotService(userId, message, history);
        
        res.json({ reply: result.reply });

    } catch (error) {
        const status = error.status || 500;
        console.error("Groq API Error:", error);
        res.status(status).json({ error: error.error || 'Failed to get response from chatbot.' });
    }
};

module.exports = {
    askChatbot,
};