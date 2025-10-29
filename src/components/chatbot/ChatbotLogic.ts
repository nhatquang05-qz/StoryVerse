import { comics, getUniqueGenres, type Comic } from '../../data/mockData';
import type { User } from '../../contexts/AuthContext';

export interface ChatbotMessage {
  id: number;
  type: 'text' | 'comic_list' | 'user_input';
  content: string | Comic[];
  sender: 'user' | 'bot';
}

const genres = getUniqueGenres();
const levelingExplanation = `
Bạn có thể lên cấp bằng cách tích lũy điểm kinh nghiệm (EXP). EXP nhận được khi:
* **Đọc truyện:** Mỗi trang/chương đọc sẽ cộng một lượng EXP nhất định.
* **Nạp Xu:** Nạp Xu cũng giúp bạn tăng EXP.
Khi thanh EXP đầy (100%), bạn sẽ lên cấp và EXP sẽ được đặt lại.
Lưu ý: Tỉ lệ nhận EXP sẽ giảm dần khi cấp độ của bạn càng cao.
Bạn có thể chọn cách hiển thị cấp bậc của mình (ví dụ: Tu Tiên, Game,...) trong trang Cài đặt hồ sơ.
`;
const coinExplanation = `
Xu là đơn vị tiền tệ trong StoryVerse. Bạn có thể nhận Xu qua các cách sau:
* **Phần thưởng hàng ngày:** Đăng nhập mỗi ngày để nhận Xu miễn phí. Phần thưởng sẽ tăng nếu bạn duy trì chuỗi đăng nhập liên tục. Truy cập mục phần thưởng trên thanh Header nhé!
* **Nạp Xu:** Bạn có thể mua các gói Xu bằng tiền thật tại trang Nạp Xu (/recharge). Nạp Xu cũng giúp bạn tăng EXP đó!
`;

const unknownCommandResponse = "Xin lỗi, mình chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về đề xuất truyện theo thể loại, tên tài khoản, cách lên cấp, hoặc cách nhận xu không?";

export const handleUserInput = (input: string, currentUser: User | null): { intent: string; data?: any } => {
  const lowerInput = input.toLowerCase().trim();

  if (['chào', 'hello', 'hi', 'xin chào'].includes(lowerInput)) {
    return { intent: 'greeting' };
  }

  if (lowerInput.includes('tên') && (lowerInput.includes('tài khoản') || lowerInput.includes('username') || lowerInput.includes('tôi'))) {
    return { intent: 'ask_username', data: currentUser };
  }

  if (lowerInput.includes('cấp') || lowerInput.includes('level') || lowerInput.includes('kinh nghiệm') || lowerInput.includes('exp')) {
      if(lowerInput.includes('làm sao') || lowerInput.includes('cách') || lowerInput.includes('nhận')){
          return { intent: 'ask_leveling' };
      }
      if(currentUser){
          return { intent: 'ask_current_level', data: currentUser};
      } else {
          return { intent: 'ask_leveling' };
      }
  }

  if (lowerInput.includes('xu') || lowerInput.includes('coin')) {
     if(lowerInput.includes('làm sao') || lowerInput.includes('cách') || lowerInput.includes('nhận') || lowerInput.includes('kiếm')){
         return { intent: 'ask_coin' };
     }
      if(currentUser){
          return { intent: 'ask_current_coin', data: currentUser};
      } else {
           return { intent: 'ask_coin' };
      }
  }

  if (lowerInput.includes('thể loại') || lowerInput.includes('truyện') || lowerInput.includes('đề xuất')) {
    for (const genre of genres) {
      if (lowerInput.includes(genre.toLowerCase())) {
        return { intent: 'recommend_genre', data: genre };
      }
    }
    if(lowerInput.includes('thể loại') || lowerInput.includes('genre')){
        return { intent: 'list_genres' };
    }
  }

  return { intent: 'unknown' };
};

const getUsername = (currentUser: User | null): string => {
  if (!currentUser) {
    return "Bạn chưa đăng nhập.";
  }
  return currentUser.fullName || currentUser.email.split('@')[0] || "người dùng";
};

 const getCurrentLevelInfo = (currentUser: User | null): string => {
    if (!currentUser) {
        return "Bạn chưa đăng nhập để xem cấp độ.";
    }
    return `Cấp độ hiện tại của bạn là ${currentUser.level} (${currentUser.exp.toFixed(2)}% kinh nghiệm).`;
};

 const getCurrentCoinBalance = (currentUser: User | null): string => {
    if (!currentUser) {
        return "Bạn chưa đăng nhập để xem số dư Xu.";
    }
    return `Số dư Xu hiện tại của bạn là ${currentUser.coinBalance} Xu.`;
};

const recommendGenre = (genre: string): Comic[] | string => {
  const normalizedGenre = genre.toLowerCase();
  const recommendedComics = comics
    .filter(comic => comic.genres.some(g => g.toLowerCase() === normalizedGenre))
    .slice(0, 5);

  if (recommendedComics.length === 0) {
    return `Rất tiếc, mình không tìm thấy truyện nào thuộc thể loại "${genre}". Bạn có thể thử các thể loại khác như: ${genres.slice(0, 5).join(', ')},...`;
  }
  return recommendedComics;
};

const listGenres = (): string => {
    return `Hiện tại StoryVerse có các thể loại truyện sau: ${genres.join(', ')}. Bạn muốn mình đề xuất thể loại nào?`;
}

export const getBotResponse = (intent: string, data?: any): { type: 'text' | 'comic_list'; content: string | Comic[] } => {
  switch (intent) {
    case 'greeting':
      return { type: 'text', content: "Chào bạn! Mình là chatbot của StoryVerse. Mình có thể giúp gì cho bạn? (Ví dụ: đề xuất truyện thể loại hành động, cách lên cấp, cách nhận xu,...)" };
    case 'ask_username':
      return { type: 'text', content: `Tên tài khoản của bạn là "${getUsername(data)}".` };
     case 'ask_current_level':
       return { type: 'text', content: getCurrentLevelInfo(data) };
    case 'ask_leveling':
      return { type: 'text', content: levelingExplanation };
    case 'ask_current_coin':
       return { type: 'text', content: getCurrentCoinBalance(data) };
    case 'ask_coin':
      return { type: 'text', content: coinExplanation };
    case 'recommend_genre':
      const result = recommendGenre(data);
      if (typeof result === 'string') {
        return { type: 'text', content: result };
      } else {
        return { type: 'comic_list', content: result };
      }
    case 'list_genres':
        return { type: 'text', content: listGenres() };
    case 'unknown':
    default:
      return { type: 'text', content: unknownCommandResponse };
  }
};