import React from 'react';
import './ChatLog.css'; // Bạn sẽ cần tạo file CSS này
import ChatMessage from './ChatMessage'; // Import component con
import { useAuth } from '../../../contexts/AuthContext'; // Import mấu chốt
import { FiSend } from 'react-icons/fi';

// --- ĐÂY LÀ DỮ LIỆU CŨ CỦA BẠN (GÂY RA LỖI) ---
// Có thể bạn đang dùng mock data hoặc tải từ API,
// nhưng dữ liệu này đang bị SAI cấp độ của "Coconut" và "ff.dai13112007"
const mockMessagesData = [
    {
      id: 1,
      userId: 'user-coconut',
      userName: "Coconut",
      avatarUrl: "https://i.imgur.com/g5V2w1D.png", // Ảnh avatar ví dụ
      timestamp: "13:40",
      message: "rùi",
      userLevel: 1 // Dữ liệu này bị cũ hoặc sai
    },
    {
      id: 2,
      userId: 'user-ffdai',
      userName: "ff.dai13112007",
      avatarUrl: "https://i.imgur.com/L30h9hZ.png", // Ảnh avatar ví dụ
      timestamp: "13:44",
      message: "cơm chó nhiều vầy 😡😡😡😡",
      userLevel: 1 // Dữ liệu này bị cũ hoặc sai
    },
     {
      id: 3,
      userId: 'user-cao',
      userName: "CÁO MẮT TRĂNG",
      avatarUrl: "https://i.imgur.com/8mVLK0f.png", // Ảnh avatar ví dụ
      timestamp: "14:00",
      message: "xin cảm nhận ik đứa",
      userLevel: 2 // Cấp 2 này đúng
    },
     {
      id: 4,
      userId: 'user-san',
      userName: "San",
      avatarUrl: "https://i.imgur.com/tq9k3Yj.png", // Ảnh avatar ví dụ
      timestamp: "14:53",
      message: "sdsds",
      userLevel: 5 // Cấp 5 này đúng
    },
];
// ---------------------------------------------


const ChatRoom: React.FC = () => {
    // Lấy thông tin user đang đăng nhập (ví dụ: Cấp 10)
    const { currentUser } = useAuth(); 

    const [messages, setMessages] = React.useState(mockMessagesData);
    const [newMessage, setNewMessage] = React.useState('');
    
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    // Cuộn xuống tin nhắn mới nhất
    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // --- 🌟 ĐÂY LÀ LOGIC SỬA LỖI 🌟 ---
    // Khi user Cấp 10 gửi tin nhắn
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const messageToSend = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.fullName, // Lấy tên user Cấp 10
            avatarUrl: "https://i.imgur.com/tq9k3Yj.png", // TODO: Thay bằng avatar của currentUser
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            message: newMessage,
            userLevel: currentUser.level, // Lấy Cấp 10 từ context
        };

        // Thêm tin nhắn mới vào danh sách
        setMessages([...messages, messageToSend]);
        setNewMessage('');
    };

    return (
        <div className="chat-room-container">
            {/* Thanh tiêu đề */}
            <div className="chat-room-header">
                Văn gởi dam đạo
            </div>

            {/* Danh sách tin nhắn */}
            <div className="chat-messages-list">
                {messages.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        avatarUrl={msg.avatarUrl}
                        userName={msg.userName}
                        timestamp={msg.timestamp}
                        message={msg.message}
                        userLevel={msg.userLevel} // prop được truyền vào
                    />
                ))}
                {/* Thẻ div rỗng để cuộn xuống */}
                <div ref={messagesEndRef} />
            </div>

            {/* Khung nhập tin nhắn */}
            {currentUser ? (
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn">
                        <FiSend />
                    </button>
                </form>
            ) : (
                <div className="chat-login-prompt">
                    Bạn phải đăng nhập để nói chuyện.
                </div>
            )}
        </div>
    );
};

export default ChatRoom;