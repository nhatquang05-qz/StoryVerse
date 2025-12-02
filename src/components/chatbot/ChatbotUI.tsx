import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { getBotResponse, type ChatHistory } from './ChatbotLogic';
import chatbotIcon from '../../assets/images/chatbot-icon.avif';
import '../../assets/styles/Chatbot.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const SUGGESTION_QUESTIONS = [
  "Làm sao để nạp xu?",
  "Top truyện hot tháng này?",
  "Web có những thể loại gì?",
  "Tôi muốn đổi mật khẩu"
];

const TOKEN_STORAGE_KEY = 'storyverse_token';

const ChatbotUI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true); 
    const [isHovered, setIsHovered] = useState(false);   
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatHistory[]>([
        { role: 'model', parts: "<p>Chào bạn! Tôi là trợ lý ảo StoryVerse. Tôi có thể giúp gì cho bạn hôm nay?</p>" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setShowWelcome(false);
        }
    }, [isOpen]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        if (!currentUser) {
            showNotification("Vui lòng đăng nhập để sử dụng chatbot.", "warning");
            return;
        }
        
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
             showNotification("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", "error");
             return;
        }

        const userMessage: ChatHistory = { role: 'user', parts: `<p>${messageText}</p>` };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const historyForBot = messages.map(msg => ({
                ...msg,
                content: msg.parts.replace(/<[^>]*>?/gm, ' ') 
            }));

            const botReplyHtml = await getBotResponse(messageText, historyForBot, token);
            
            const botMessage: ChatHistory = { role: 'model', parts: botReplyHtml };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Lỗi Chatbot:", error);
            const errorMessage: ChatHistory = { role: 'model', parts: "<p>Hệ thống đang bận, vui lòng thử lại sau.</p>" };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    };

    return (
        <div className="chatbot-container">
            {!isOpen && (
                <div 
                    className="chatbot-toggle-wrapper"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {showWelcome && (
                        <div className="chatbot-tooltip welcome-tooltip">
                            <span>Chào bạn! Cần hỗ trợ gì không?</span>
                            <button 
                                className="tooltip-close-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowWelcome(false);
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {!showWelcome && isHovered && (
                        <div className="chatbot-tooltip hover-tooltip">
                            <span>Chat ngay!</span>
                        </div>
                    )}

                    <button 
                        className="chatbot-toggle-button" 
                        onClick={() => setIsOpen(true)}
                        aria-label="Mở Chatbot"
                    >
                        <img src={chatbotIcon} alt="Chatbot" />
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>
                            <Bot size={20} className="mr-2" /> StoryVerse Support
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="close-chat-btn">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.role}`}>
                                {msg.role === 'model' && (
                                    <div className="message-avatar">
                                        <img src={chatbotIcon} alt="Bot" />
                                    </div>
                                )}
                                <div 
                                    className="message-content"
                                    dangerouslySetInnerHTML={{ __html: msg.parts }} 
                                />
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message model">
                                <div className="message-avatar">
                                    <img src={chatbotIcon} alt="Bot" />
                                </div>
                                <div className="message-content typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        {!isLoading && (
                            <div className="suggestions-container">
                                {SUGGESTION_QUESTIONS.map((question, idx) => (
                                    <button 
                                        key={idx} 
                                        className="suggestion-chip"
                                        onClick={() => handleSendMessage(question)}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        <form className="input-form" onSubmit={onSubmit}>
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder={currentUser ? "Nhập tin nhắn..." : "Đăng nhập để chat..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading || !currentUser}
                            />
                            <button 
                                type="submit" 
                                className="send-btn"
                                disabled={isLoading || !input.trim() || !currentUser}
                            >
                                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotUI;