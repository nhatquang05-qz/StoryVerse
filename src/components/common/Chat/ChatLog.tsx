import React, { useEffect, useRef, useState } from 'react';
import './ChatLog.css';
import ChatMessage from './ChatMessage';
import { useAuth } from '../../../contexts/AuthContext';
import { FiSend } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList'; 


interface ChatMessageData {
  id: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  timestamp: string;
  message: string;
  userLevel: number;
}


const mockMessagesData: ChatMessageData[] = [
];


const ChatLog: React.FC = () => {
    const { currentUser, getEquivalentLevelTitle } = useAuth();
    const [messages, setMessages] = useState<ChatMessageData[]>(() => {
        if (currentUser && !mockMessagesData.some(m => m.userId === currentUser.id)) {
             const userMessages: ChatMessageData[] = [
                 {
                    id: 7,
                    userId: currentUser.id,
                    userName: currentUser.fullName || currentUser.email.split('@')[0],
                    avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
                    timestamp: "03:50",
                    message: "Tin nhắn cũ 1",
                    userLevel: currentUser.level
                 },
                 {
                    id: 8,
                    userId: currentUser.id,
                    userName: currentUser.fullName || currentUser.email.split('@')[0],
                    avatarUrl: "https://i.imgur.com/tq9k3Yj.png",
                    timestamp: "03:51",
                    message: "Tin nhắn cũ 2",
                    userLevel: currentUser.level
                 }
             ];
             return [...mockMessagesData, ...userMessages];
        }
        return mockMessagesData;
    });
    const [newMessage, setNewMessage] = useState('');
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);

    const systemKey = localStorage.getItem('user_level_system') || 'Ma Vương';
    const renderKey = currentUser ? `${currentUser.id}-${currentUser.level}-${systemKey}` : 'default';

    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages, renderKey]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        // Sử dụng hàm isProfane đã import
        if (isProfane(newMessage)) {
            setIsWarningPopupOpen(true);
            return;
        }

        const messageToSend: ChatMessageData = {
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

    const getLevelTitleForDisplay = (userId: string, userLevel: number): string => {
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
                {messages.map((msg: ChatMessageData) => (
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

            <ProfanityWarningPopup
                isOpen={isWarningPopupOpen}
                onClose={() => setIsWarningPopupOpen(false)}
            />
        </div>
    );
};

export default ChatLog;