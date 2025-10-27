import React, { useEffect, useRef, useState } from 'react';
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
    {
      id: 5,
      userId: 'user-duongnguyennhatquang@gmail.com', 
      userName: "duongnguyennhatquang",
      avatarUrl: "https://i.imgur.com/tq9k3Yj.png", 
      timestamp: "03:48",
      message: "sdsdsd",
      userLevel: 13 
    },
     {
      id: 6,
      userId: 'user-duongnguyennhatquang@gmail.com',
      userName: "duongnguyennhatquang",
      avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
      timestamp: "03:49",
      message: "sssd",
      userLevel: 13
    },
];

const ChatLog: React.FC = () => {
    const { currentUser, getEquivalentLevelTitle } = useAuth();
    const [messages, setMessages] = useState(() => {
        if (currentUser && !mockMessagesData.some(m => m.userId === currentUser.id)) {
             return [
                 ...mockMessagesData,
                 {
                    id: 5, userId: currentUser.id, userName: currentUser.fullName || currentUser.email.split('@')[0],
                    avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:50", message: "Tin nhắn cũ 1", userLevel: currentUser.level
                 },
                 {
                    id: 6, userId: currentUser.id, userName: currentUser.fullName || currentUser.email.split('@')[0],
                    avatarUrl: "https://i.imgur.com/tq9k3Yj.png", timestamp: "03:51", message: "Tin nhắn cũ 2", userLevel: currentUser.level
                 }
             ];
        }
        return mockMessagesData;
    });
    const [newMessage, setNewMessage] = useState('');
    const chatMessagesListRef = useRef<HTMLDivElement>(null);

    const systemKey = localStorage.getItem('user_level_system') || 'Ma Vương';
    const renderKey = currentUser ? `${currentUser.id}-${currentUser.level}-${systemKey}` : 'default'; // Thêm level vào key

    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages, renderKey]);

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

        setMessages(prev => [...prev, messageToSend]);
        setNewMessage('');
    };

    const getLevelTitleForDisplay = (userId: string, userLevel: number) => {
        if (currentUser && userId === currentUser.id) {
            return getEquivalentLevelTitle(userLevel);
        } else {
            return `Cấp ${userLevel}`;
        }
    };


    return (
        <div key={renderKey} className="chat-room-container">
            <div className="chat-room-header">
                Vạn hữu đàm đạo
            </div>

            <div className="chat-messages-list" ref={chatMessagesListRef}>
                {messages.map(msg => (
                    <ChatMessage
                        key={msg.id}
                        avatarUrl={msg.avatarUrl}
                        userName={msg.userName}
                        timestamp={msg.timestamp}
                        message={msg.message}
                        userLevel={msg.userLevel}
                        levelTitle={getLevelTitleForDisplay(msg.userId, msg.userLevel)}
                    />
                ))}
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

export default ChatLog;