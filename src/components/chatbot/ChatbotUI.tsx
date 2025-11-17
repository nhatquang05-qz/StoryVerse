import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';
import { getBotResponse, type ChatHistory } from './ChatbotLogic';
import chatbotIcon from '../../assets/images/chatbot-icon.png';
import '../../assets/styles/Chatbot.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const TOKEN_STORAGE_KEY = 'storyverse_token';

const ChatbotUI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatHistory[]>([
        { role: 'model', parts: "<p>Chào bạn! Tôi là StoryVerse Bot. Tôi có thể giúp gì cho bạn?</p>" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatboxRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        const messageText = input.trim();
        if (messageText === '' || isLoading) return;

        if (!currentUser) {
            showNotification("Vui lòng đăng nhập để sử dụng chatbot.", "warning");
            setIsOpen(false);
            return;
        }
        
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
             showNotification("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", "error");
             setIsOpen(false);
             return;
        }

        const userMessage: ChatHistory = { role: 'user', parts: `<p>${messageText}</p>` };
        
        const historyForBot = messages.map(msg => ({
            ...msg,
            content: msg.parts.replace(/<[^>]*>?/gm, ' ') 
        }));

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botReplyHtml = await getBotResponse(messageText, historyForBot, token);
            const botMessage: ChatHistory = { role: 'model', parts: botReplyHtml };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Lỗi khi xử lý tin nhắn:", error);
            const errorMessage: ChatHistory = { role: 'model', parts: "<p>Xin lỗi, tôi gặp lỗi khi xử lý. Vui lòng thử lại.</p>" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const userFallbackAvatar = "https://i.imgur.com/tq9k3Yj.png";
    
    const getPlaceholderText = () => {
        if (isLoading) return "Bot đang trả lời...";
        if (!currentUser) return "Vui lòng đăng nhập để chat...";
        return "Hỏi tôi bất cứ điều gì...";
    };

    return (
        <>
            <button className="chatbot-toggle-button" onClick={toggleChatbot} aria-label="Mở chatbot">
                <img src={chatbotIcon} alt="Chatbot" />
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>StoryVerse Bot</h3>
                        <button onClick={toggleChatbot} className="chatbot-close-btn" aria-label="Đóng chatbot">
                            <FiX />
                        </button>
                    </div>

                    <div className="chatbot-messages" ref={chatboxRef}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.role}`}>
                                <span className="message-icon">
                                    {msg.role === 'model' ? (
                                        <img src={chatbotIcon} alt="Bot icon" />
                                    ) : (
                                        <img 
                                            src={currentUser?.avatarUrl || userFallbackAvatar} 
                                            alt="User icon" 
                                        />
                                    )}
                                </span>
                                
                                <div 
                                    className="chatbot-message-content" 
                                    dangerouslySetInnerHTML={{ __html: msg.parts }} 
                                />

                            </div>
                        ))}
                        {isLoading && (
                            <div className="chat-message model">
                                <span className="message-icon">
                                    <img src={chatbotIcon} alt="Bot icon" />
                                </span>
                                <p className="loading-dots">
                                    <FiLoader className="animate-spin" />
                                </p>
                            </div>
                        )}
                    </div>

                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={getPlaceholderText()}
                            disabled={isLoading || !currentUser}
                        />
                        <button 
                            type="submit" 
                            disabled={isLoading || input.trim() === '' || !currentUser}
                            aria-label="Gửi tin nhắn"
                        >
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotUI;