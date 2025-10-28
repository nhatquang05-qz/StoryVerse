import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import ChatMessage from './ChatMessage';
import { FiSend } from 'react-icons/fi';
import ProfanityWarningPopup from '../../popups/ProfanityWarningPopup';
import { isProfane } from '../../../utils/profanityList'; 
import './ChapterChat.css';


interface ChatMessageData {
  id: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  timestamp: string;
  message: string;
  userLevel: number;
}

interface ChapterChatProps {
    comicId: number;
    chapterId: number;
}


const getStorageKey = (comicId: number, chapterId: number) => {
    return `storyverse_chat_${comicId}_${chapterId}`;
};

const ChapterChat: React.FC<ChapterChatProps> = ({ comicId, chapterId }) => {
    const { currentUser, getEquivalentLevelTitle } = useAuth();
    const { showNotification } = useNotification();
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const chatMessagesListRef = useRef<HTMLDivElement>(null);
    const [isWarningPopupOpen, setIsWarningPopupOpen] = useState(false);

    const STORAGE_KEY = getStorageKey(comicId, chapterId);

    useEffect(() => {
        try {
            const storedMessages = localStorage.getItem(STORAGE_KEY);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Lỗi tải tin nhắn chương:", error);
            setMessages([]);
        }

        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [STORAGE_KEY]);

    useEffect(() => {
        if (chatMessagesListRef.current) {
            chatMessagesListRef.current.scrollTop = chatMessagesListRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) {
            if(!currentUser) showNotification("Bạn cần đăng nhập để bình luận", "warning");
            return;
        }

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

        const newMessages = [...messages, messageToSend];
        setMessages(newMessages);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
        setNewMessage('');
    };

    const getLevelTitleForDisplay = (userId: string, userLevel: number): string => {
        if (currentUser && userId === currentUser.id) {
            return getEquivalentLevelTitle(userLevel);
        }
        return `Cấp ${userLevel}`;
    };

    return (
        <div className="chapter-chat-container">
            <div className="chat-room-header">
                Bàn luận
            </div>

            <div className="chat-messages-list" ref={chatMessagesListRef}>
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <ChatMessage
                            key={msg.id}
                            avatarUrl={msg.avatarUrl}
                            userName={msg.userName}
                            timestamp={msg.timestamp}
                            message={msg.message}
                            userLevel={msg.userLevel}
                            levelTitle={getLevelTitleForDisplay(msg.userId, msg.userLevel)}
                        />
                    ))
                ) : (
                    <div className="chat-login-prompt" style={{border: 'none', color: 'var(--clr-text-secondary)'}}>
                        Chưa có bình luận nào.
                    </div>
                )}
            </div>

            {currentUser ? (
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Viết bình luận của bạn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                       <FiSend />
                    </button>
                </form>
            ) : (
                <div className="chat-login-prompt">
                    Bạn phải đăng nhập để bình luận.
                </div>
            )}

            <ProfanityWarningPopup
                isOpen={isWarningPopupOpen}
                onClose={() => setIsWarningPopupOpen(false)}
            />
        </div>
    );
};

export default ChapterChat;