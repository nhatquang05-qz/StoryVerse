const Groq = require('groq-sdk');
const userModel = require('../models/userModel'); 
const comicModel = require('../models/comicModel'); 

if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set. Please add it to your .env file.");
}

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL_NAME = 'openai/gpt-oss-120b'; 

const askChatbotService = async (userId, message, history) => {
    if (!userId) {
        throw { status: 401, error: 'Unauthorized. Please log in.' };
    }
    if (!message) {
        throw { status: 400, error: 'Message is required.' };
    }
    if (!process.env.GROQ_API_KEY) {
         throw { status: 500, error: 'Chatbot is not configured.' };
    }
    
    try {
        let comicContext = "Dưới đây là một số thông tin về trang web StoryVerse:\n\n";
        let allComicsForContext = [];

        try {
            const topViewedRows = await comicModel.getTopViewedComicsRaw();
            const topRatedRows = await comicModel.getTopRatedComicsRaw();
            const topUserRows = await userModel.getTopUsersRaw(5);
            const genreRows = await comicModel.getAllGenresRaw();
            
            const comicMap = new Map();
            [...topViewedRows, ...topRatedRows].forEach(c => comicMap.set(c.id, c));
            allComicsForContext = Array.from(comicMap.values());
            
            if (genreRows.length > 0) { 
                comicContext += "== CÁC THỂ LOẠI TRUYỆN HIỆN CÓ ==\n";
                comicContext += genreRows.map(g => g.name).join(', ') + "\n\n";
            }
            
            if (topViewedRows.length > 0) {
                comicContext += "== TOP TRUYỆN XEM NHIỀU (Sắp xếp theo lượt xem) ==\n";
                comicContext += topViewedRows.map(c => 
                    `- (ID: ${c.id}) ${c.title} (Tác giả: ${c.author || 'N/A'}, Thể loại: ${c.genres || 'N/A'}, Lượt xem: ${c.viewCount})`
                ).join("\n") + "\n\n";
            }

            if (topRatedRows.length > 0) {
                comicContext += "== TOP TRUYỆN ĐÁNH GIÁ CAO (Sắp xếp theo sao) ==\n";
                comicContext += topRatedRows.map(c => 
                    `- (ID: ${c.id}) ${c.title} (Tác giả: ${c.author || 'N/A'}, Rating: ${Number(c.avgRating).toFixed(1)} sao)`
                ).join("\n") + "\n\n";
            }

            if (topUserRows.length > 0) {
                comicContext += "== TOP THÀNH VIÊN (CAO THỦ) ==\n";
                comicContext += topUserRows.map(u => 
                    `- ${u.fullName} (Cấp: ${u.level}, EXP: ${u.exp}%)`
                ).join("\n") + "\n\n";
            }
            
            comicContext += "== CÁCH TĂNG CẤP VÀ EXP ==\n";
            comicContext += "Bạn có thể tăng cấp và nhận EXP bằng cách đọc truyện (tính theo số trang đọc) và khi nạp Xu. Mở khóa chương truyện trả phí cũng cho bạn EXP.\n\n";
            
            comicContext += "== CÁCH NẠP XU ==\n";
            comicContext += "Để nạp Xu, bạn có thể vào trang 'Nạp Xu' từ menu tài khoản của mình (thường có link là /recharge).\n\n";

            comicContext += "== CÁCH ĐỔI CON TRỎ CHUỘT ==\n";
            comicContext += "Bạn có thể thay đổi con trỏ chuột theo phong cách anime bằng cách vào mục 'Cài Đặt' (link /settings) từ menu tài khoản.\n\n";

            comicContext += "== THƯỞNG HÀNG NGÀY ==\n";
            comicContext += "Bạn có thể nhận thưởng (Xu) mỗi ngày bằng cách bấm vào biểu tượng hộp quà (Gift) trên thanh header. Đăng nhập liên tục sẽ nhận được nhiều phần thưởng hơn.\n\n";


        } catch (dbError) {
            console.error("Lỗi khi lấy dữ liệu cho chatbot:", dbError);
        }
  
        const messages = [
            {
                role: "system",
                content: `Bạn là StoryVerse Bot, trợ lý AI cho trang web truyện tranh StoryVerse.
                
                ${comicContext} 

                Nhiệm vụ của bạn:
                1. Trả lời thân thiện, ngắn gọn, và CHỈ SỬ DỤNG TIẾNG VIỆT.
                2. Khi người dùng hỏi về truyện ("nên đọc gì", "truyện hay", "tìm truyện [thể loại]"), HÃY SỬ DỤNG DANH SÁCH TRUYỆN (TOP XEM NHIỀU, TOP ĐÁNH GIÁ CAO) ĐÃ CUNG CẤP.
                3. Khi người dùng hỏi về "top truyện", "top thành viên", "thể loại", "cách tăng cấp", "nạp xu", "đổi con trỏ", "thưởng hàng ngày", hãy trả lời dựa trên data tương ứng.
                4. **QUAN TRỌNG:** Chỉ đề cập đến truyện có trong danh sách. Không được bịa ra truyện.
                5. Khi đề xuất một truyện, hãy **luôn nhắc đến tên đầy đủ của truyện đó** (ví dụ: "Bạn có thể thử đọc Võ Luyện Đỉnh Phong").
                6. Nếu không biết, hãy nói "Tôi chưa tìm thấy thông tin đó, bạn có thể thử tìm kiếm trên thanh công cụ nhé!".`
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
            max_tokens: 250, 
        });

        let reply = chatCompletion.choices[0]?.message?.content || "Xin lỗi, tôi không thể trả lời lúc này.";
        
        const suggestions = [];
        for (const comic of allComicsForContext) {
            const titleRegex = new RegExp(comic.title.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
            if (titleRegex.test(reply)) {
                suggestions.push({
                    id: comic.id,
                    title: comic.title,
                    imageUrl: comic.coverImageUrl
                });
                reply = reply.replace(titleRegex, '');
            }
        }

        let htmlReply = `<p>${reply.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
        
        if (suggestions.length > 0) {
            htmlReply += suggestions.map(s => 
                `<a href="/comic/${s.id}" class="chatbot-suggestion">
                    <img src="${s.imageUrl}" alt="${s.title}" />
                    <span>${s.title}</span>
                </a>`
            ).join('');
        }
        
        return { reply: htmlReply, status: 200 };

    } catch (error) {
        console.error("Groq API Error in service:", error);
        throw { status: error.status || 500, error: 'Failed to get response from chatbot.' };
    }
};

module.exports = {
    askChatbotService,
};