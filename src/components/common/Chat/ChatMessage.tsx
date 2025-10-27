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

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const getTextColorForBackground = (bgColor: string): string => {
  const rgb = hexToRgb(bgColor);
  if (!rgb) {
    return '#FFFFFF'; 
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#333333' : '#FFFFFF'; 
};


const ChatMessage: React.FC<ChatMessageProps> = ({
  avatarUrl,
  userName,
  timestamp,
  message,
  userLevel,
}) => {
  const { getLevelColor } = useAuth();
  const levelColor = userLevel ? getLevelColor(userLevel) : '#6c757d'; 
  const levelTextColor = getTextColorForBackground(levelColor);

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