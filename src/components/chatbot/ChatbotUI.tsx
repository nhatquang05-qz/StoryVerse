import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import { FiSend, FiX, FiUser, FiLoader } from 'react-icons/fi';
import { getBotResponse, type ChatHistory } from './ChatbotLogic';
import chatbotIcon from '../../assets/images/chatbot-icon.png';
import './Chatbot.css';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const TOKEN_STORAGE_KEY = 'storyverse_token';

const ChatbotUI: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatHistory[]>([
        { role: 'model', parts: "Chào bạn! Tôi là StoryVerse Bot. Tôi có thể giúp gì cho bạn?" }
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

        const userMessage: ChatHistory = { role: 'user', parts: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const botReply = await getBotResponse(messageText, messages, token);
        const botMessage: ChatHistory = { role: 'model', parts: botReply };
        
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
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
                                    {msg.role === 'model' ? <img src={chatbotIcon} alt="Bot icon" /> : <FiUser />}
                                </span>
                                <p>{msg.parts}</p>
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
                            placeholder={isLoading ? "Bot đang trả lời..." : "Hỏi tôi bất cứ điều gì..."}
                            disabled={isLoading || !currentUser}
                        />
                        <button type="submit" disabled={isLoading || input.trim() === ''}>
                            <FiSend />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
};

export default ChatbotUI;