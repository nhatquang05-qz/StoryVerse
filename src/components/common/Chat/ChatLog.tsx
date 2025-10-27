import React from 'react';
import './ChatLog.css';
import ChatMessage from './ChatMessage';
import { useAuth } from '../../../contexts/AuthContext';
import { FiSend } from 'react-icons/fi';

const mockMessagesData = [
    {
      id: 1,
      userId: 'user-coconut',
      userName: "Coconut",
      avatarUrl: "https://i.imgur.com/g5V2w1D.png",
      timestamp: "13:40",
      message: "rùi",
      userLevel: 1
    },
    {
      id: 2,
      userId: 'user-ffdai',
      userName: "ff.dai13112007",
      avatarUrl: "https://i.imgur.com/L30h9hZ.png",
      timestamp: "13:44",
      message: "cơm chó nhiều vầy 😡😡😡😡",
      userLevel: 1
    },
     {
      id: 3,
      userId: 'user-cao',
      userName: "CÁO MẮT TRĂNG",
      avatarUrl: "https://i.imgur.com/8mVLK0f.png",
      timestamp: "14:00",
      message: "xin cảm nhận ik đứa",
      userLevel: 2
    },
     {
      id: 4,
      userId: 'user-san',
      userName: "San",
      avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
      timestamp: "14:53",
      message: "sdsds",
      userLevel: 5
    },
];


const ChatRoom: React.FC = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = React.useState(mockMessagesData);
    const [newMessage, setNewMessage] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        const messageToSend = {
            id: Date.now(),
            userId: currentUser.id,
            userName: currentUser.fullName || currentUser.email.split('@')[0],
            avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            message: newMessage,
            userLevel: currentUser.level,
        };

        setMessages([...messages, messageToSend]);
        setNewMessage('');
    };

    return (
        <div className="chat-room-container">
            <div className="chat-room-header">
                Vạn hữu đàm đạo
            </div>

            <div className="chat-messages-list">
                {messages.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        avatarUrl={msg.avatarUrl}
                        userName={msg.userName}
                        timestamp={msg.timestamp}
                        message={msg.message}
                        userLevel={currentUser && msg.userId === currentUser.id ? currentUser.level : msg.userLevel}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {currentUser ? (
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
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