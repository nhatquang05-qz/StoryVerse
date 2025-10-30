const Groq = require('groq-sdk');
const { getConnection } = require('../db/connection'); 

if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set. Please add it to your .env file.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL_NAME = 'openai/gpt-oss-120b'; 

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

        let comicContext = "";
        try {
            const connection = getConnection();
            const [comicRows] = await connection.execute(`
                SELECT title, author, genres 
                FROM comics 
                ORDER BY updatedAt DESC 
                LIMIT 20
            `);
            
            if (comicRows.length > 0) {
                const comicList = comicRows.map(comic => 
                    `- ${comic.title} (Tác giả: ${comic.author || 'N/A'}, Thể loại: ${comic.genres || 'N/A'})`
                ).join("\n");
                
                comicContext = `Đây là danh sách một số truyện nổi bật có trên website StoryVerse:\n${comicList}\n\n`;
            }
        } catch (dbError) {
            console.error("Lỗi khi lấy danh sách truyện cho chatbot:", dbError);
        }
  
        const messages = [
            {
                role: "system",
                content: `Bạn là StoryVerse Bot, trợ lý AI cho trang web truyện tranh StoryVerse. 
                Nhiệm vụ của bạn là trả lời thân thiện, ngắn gọn.
                
                ${comicContext} 

                Khi người dùng hỏi về truyện ("nên đọc gì", "kể tên truyện", "tìm truyện"), HÃY SỬ DỤNG DANH SÁCH TRUYỆN ĐÃ CUNG CẤP Ở TRÊN để đề xuất. 
                Không được bịa ra truyện không có trong danh sách. 
                Nếu không biết, hãy nói "Tôi chưa tìm thấy truyện đó, bạn có thể thử tìm kiếm trên thanh công cụ nhé!".
                Chỉ trả lời bằng tiếng Việt.`
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