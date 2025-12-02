import React from 'react';
import '../../../assets/styles/ChatMessage.css';
import { useAuth } from '../../../contexts/AuthContext';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';
import top1Icon from '../../../assets/images/top1.avif';
import top2Icon from '../../../assets/images/top2.avif';
import top3Icon from '../../../assets/images/top3.avif';

export interface ChatMessageData {
 id: number;
 userId: string;
 userName: string;
 avatarUrl: string;
 timestamp: string;
 message: string;
 userLevel: number;
 imageUrl?: string;
 stickerUrl?: string; 
 likes?: string[];
 replyTo?: number;
 replyToAuthor?: string;
}

interface ChatMessageProps {
 msg: ChatMessageData;
 levelTitle: string;
 onLike: (messageId: number) => void;
 onReply: (messageId: number, authorName: string) => void;
 currentUserId: string | null;
  rank?: number;
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
 msg,
 levelTitle,
 onLike,
 onReply,
 currentUserId,
  rank,
}) => {
 const { getLevelColor } = useAuth();
 const levelColor = msg.userLevel ? getLevelColor(msg.userLevel) : '#6c757d';
 const levelTextColor = getTextColorForBackground(levelColor);
 const likeCount = msg.likes?.length || 0;
 const isLikedByCurrentUser = currentUserId ? msg.likes?.includes(currentUserId) : false;

 return (
  <div className={`chat-message-item ${msg.replyTo ? 'reply-message-item' : ''}`}>
   <div className="chat-avatar">
    <img src={msg.avatarUrl} alt={`${msg.userName}'s avatar`} />
   </div>
   <div className="chat-content">
    <div className="chat-header">
     <span className="user-info">
      <span className="user-name">{msg.userName}</span>
            {rank === 1 && <img src={top1Icon} alt="Top 1" className="chat-rank-icon" />}
            {rank === 2 && <img src={top2Icon} alt="Top 2" className="chat-rank-icon" />}
            {rank === 3 && <img src={top3Icon} alt="Top 3" className="chat-rank-icon" />}
      {msg.userLevel && (
       <span
        className="user-level"
        style={{ backgroundColor: levelColor, color: levelTextColor }}
       >
        {levelTitle}
       </span>
      )}
     </span>
     <span className="timestamp">{msg.timestamp}</span>
    </div>
    {msg.replyTo && msg.replyToAuthor && (
      <div className="reply-info">
        Trả lời <span className="reply-to-author">@{msg.replyToAuthor}</span>
      </div>
    )}
    {msg.message && <div className="message-text">{msg.message}</div>}
    {msg.imageUrl && (
     <div className="message-image-container">
      <img src={msg.imageUrl} alt="Uploaded content" className="message-image" />
     </div>
    )}
    {msg.stickerUrl && (
     <div className="message-sticker-container">
      <img src={msg.stickerUrl} alt="Sticker" className="message-sticker" />
     </div>
    )}
    <div className="message-actions">
       <button
        className={`action-button like-button ${isLikedByCurrentUser ? 'liked' : ''}`}
        onClick={() => onLike(msg.id)}
        disabled={!currentUserId}
        title={currentUserId ? (isLikedByCurrentUser ? "Bỏ thích" : "Thích") : "Đăng nhập để thích"}
       >
        <FiHeart fill={isLikedByCurrentUser ? 'currentColor' : 'none'} />
        {likeCount > 0 && <span className="like-count">{likeCount}</span>}
      </button>
      <button
       className="action-button reply-button"
       onClick={() => onReply(msg.id, msg.userName)}
       disabled={!currentUserId}
       title={currentUserId ? "Trả lời" : "Đăng nhập để trả lời"}
      >
        <FiMessageSquare />
      </button>
    </div>
   </div>
  </div>
 );
};

export default ChatMessage;