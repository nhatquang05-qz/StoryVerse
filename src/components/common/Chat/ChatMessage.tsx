import React from 'react';
import './ChatMessage.css';
import { useAuth } from '../../../contexts/AuthContext'; 

interface ChatMessageProps {
  avatarUrl: string;
  userName: string;
  timestamp: string;
  message: string;
  userLevel?: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  avatarUrl,
  userName,
  timestamp,
  message,
  userLevel,
}) => {
  const { getLevelColor } = useAuth();   
  const levelColor = userLevel ? getLevelColor(userLevel) : '#6c757d';  
  const getTextColor = (bgColor: string): string => {    
     const darkColors = ['#6c757d', '#dc3545', '#6f42c1']; 
     return darkColors.includes(bgColor) ? 'white' : '#333'; 
  };

  const levelTextColor = getTextColor(levelColor);
  
  return (
    <div className="chat-message-item">
      <div className="chat-avatar">
        <img src={avatarUrl} alt={`${userName}'s avatar`} />
      </div>
      <div className="chat-content">
        <div className="chat-header">
          <span className="user-info">
            <span className="user-name">{userName}</span>
            {userLevel && (
              <span
                className="user-level"
                style={{ backgroundColor: levelColor, color: levelTextColor }} 
              >
                Cấp {userLevel}
              </span>
            )}
          </span>
          <span className="timestamp">{timestamp}</span>
        </div>
        <div className="message-text">{message}</div>
      </div>
    </div>
  );
};

export default ChatMessage;