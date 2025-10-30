const Groq = require('groq-sdk');

if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set. Please add it to your .env file.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL_NAME = 'llama3-8b-8192'; 

const askChatbot = async (req, res) => {
    try {
        const { message, history } = req.body;
        const { userId } = req;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        }
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }
        if (!process.env.GROQ_API_KEY) {
             return res.status(500).json({ error: 'Chatbot is not configured.' });
        }

        const messages = [
            {
                role: "system",
                content: "Bạn là một trợ lý chatbot thân thiện tên là StoryVerse Bot cho một trang web đọc truyện tranh. Hãy trả lời các câu hỏi của người dùng một cách ngắn gọn, thân thiện và hữu ích. Nếu người dùng hỏi về truyện tranh, hãy đưa ra các gợi ý chung chung. Không tiết lộ thông tin nhạy cảm. Chỉ trả lời bằng tiếng Việt."
            },
            ...history.map(item => ({
                role: item.role,
                content: item.content 
            })),
            {
                role: "user",
                content: message
            }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: MODEL_NAME,
            temperature: 0.7,
            max_tokens: 200,
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này.";
        
        res.json({ reply: reply });

    } catch (error) {
        console.error("Groq API Error:", error);
        res.status(500).json({ error: 'Failed to get response from chatbot.' });
    }
};

module.exports = {
    askChatbot,
};