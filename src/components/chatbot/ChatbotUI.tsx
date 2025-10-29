// src/components/chatbot/ChatbotUI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiSend } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { handleUserInput, getBotResponse, type ChatbotMessage } from './ChatbotLogic';
import type { Comic } from '../../data/mockData';
import { Link } from 'react-router-dom';
import './Chatbot.css';
import chatbotIcon from '../../assets/images/chatbot-icon.png'; // <-- THAY ĐỔI ĐƯỜNG DẪN NẾU CẦN

const ChatbotUI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatbotMessage[]>([
    { id: Date.now(), type: 'text', content: "Chào bạn! Mình là chatbot của StoryVerse. Bạn cần giúp gì?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { currentUser, getEquivalentLevelTitle } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

   useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (text.trim() === '') return;

    const userMessage: ChatbotMessage = {
      id: Date.now(),
      type: 'user_input',
      content: text,
      sender: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    const { intent, data } = handleUserInput(text, currentUser);

    await new Promise(resolve => setTimeout(resolve, 500));

    let botResponse = getBotResponse(intent, data);

    if (intent === 'ask_current_level' && currentUser) {
         const levelTitle = getEquivalentLevelTitle(currentUser.level);
         botResponse = { type: 'text', content: `Cấp độ hiện tại của bạn là ${currentUser.level} (${levelTitle}) với ${currentUser.exp.toFixed(2)}% kinh nghiệm.`}
    } else if (intent === 'ask_current_coin' && currentUser) {
         botResponse = { type: 'text', content: `Số dư Xu hiện tại của bạn là ${currentUser.coinBalance} Xu.`}
    }

    const botMessage: ChatbotMessage = {
      id: Date.now() + 1,
      type: botResponse.type,
      content: botResponse.content,
      sender: 'bot',
    };
    setMessages(prev => [...prev, botMessage]);

  }, [currentUser, getEquivalentLevelTitle]);

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendMessage(inputValue);
  };

  const renderMessageContent = (msg: ChatbotMessage) => {
    if (msg.type === 'comic_list' && Array.isArray(msg.content)) {
      const comics = msg.content as Comic[];
      return (
        <div>
          <p>Đây là một vài truyện bạn có thể thích:</p>
          <ul>
            {comics.map(comic => (
              <li key={comic.id}>
                <Link to={`/comic/${comic.id}`}>{comic.title}</Link> (Tác giả: {comic.author})
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return <p>{msg.content as string}</p>;
  };

  return (
    <>
      <button
        className={`chatbot-toggle-button ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Đóng Chatbot" : "Mở Chatbot"}
      >
        {isOpen ? <FiX /> : <img src={chatbotIcon} alt="Chatbot Icon" />}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <span>StoryVerse Chatbot</span>
            <button onClick={toggleChat} aria-label="Đóng Chatbot"><FiX /></button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                 {renderMessageContent(msg)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className="chatbot-input-form" onSubmit={handleFormSubmit}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nhập câu hỏi của bạn..."
              value={inputValue}
              onChange={handleInputChange}
            />
            <button type="submit" aria-label="Gửi tin nhắn"><FiSend /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatbotUI;