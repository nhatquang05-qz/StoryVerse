import React from 'react';
import '../../../assets/styles/ChatMessage.css';
import { useAuth } from '../../../contexts/AuthContext';
import { getEquivalentLevelTitle, getTextColorForBackground } from '../../../utils/authUtils';
import { FiHeart, FiMessageSquare, FiFlag } from 'react-icons/fi';
import top1Icon from '../../../assets/images/top1.avif';
import top2Icon from '../../../assets/images/top2.avif';
import top3Icon from '../../../assets/images/top3.avif';
import defaultAvatarImg from '../../../assets/images/defaultAvatar.webp';

export interface ChatMessageData {
	id: number;
	userId: string;
	userName: string;
	avatarUrl: string;
	timestamp: string;
	message: string;
	userLevel: number;
	levelSystem?: string;
	imageUrl?: string;
	stickerUrl?: string;
	likes?: string[];
	replyTo?: number;
	replyToAuthor?: string;
}

interface ChatMessageProps {
	msg: ChatMessageData;
	onLike: (messageId: number) => void;
	onReply: (messageId: number, authorName: string) => void;
	onReport?: (messageId: number) => void;
	onUserClick: (userId: string) => void;
	currentUserId: string | null;
	rank?: number;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
	msg,
	onLike,
	onReply,
	onReport,
	onUserClick,
	currentUserId,
	rank,
}) => {
	const { getLevelColor } = useAuth();
	const levelColor = msg.userLevel ? getLevelColor(msg.userLevel) : '#6c757d';
	const levelTextColor = getTextColorForBackground(levelColor);

	const likeCount = msg.likes?.length || 0;
	const isLikedByCurrentUser = currentUserId ? msg.likes?.includes(currentUserId) : false;

	const isOwnMessage = currentUserId === msg.userId;

	const displayLevelTitle = getEquivalentLevelTitle(
		msg.userLevel,
		msg.levelSystem || 'Bình Thường',
	);

	const getAvatarSrc = (url: string | null | undefined) => {
		if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
		return url;
	};

	return (
		<div className={`chat-message-item ${msg.replyTo ? 'reply-message-item' : ''}`}>
			<div
				className="chat-avatar"
				onClick={() => onUserClick(msg.userId)}
				style={{ cursor: 'pointer' }}
			>
				<img src={getAvatarSrc(msg.avatarUrl)} alt={`${msg.userName}'s avatar`} />
			</div>
			<div className="chat-content">
				<div className="chat-header">
					<span className="user-info">
						<span
							className="user-name"
							onClick={() => onUserClick(msg.userId)}
							style={{ cursor: 'pointer' }}
						>
							{msg.userName}
						</span>
						{rank === 1 && (
							<img src={top1Icon} alt="Top 1" className="chat-rank-icon" />
						)}
						{rank === 2 && (
							<img src={top2Icon} alt="Top 2" className="chat-rank-icon" />
						)}
						{rank === 3 && (
							<img src={top3Icon} alt="Top 3" className="chat-rank-icon" />
						)}
						{msg.userLevel && (
							<span
								className="user-level"
								style={{ backgroundColor: levelColor, color: levelTextColor }}
								title={`Hệ thống: ${msg.levelSystem || 'Bình Thường'}`}
							>
								{displayLevelTitle}
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
					>
						<FiHeart fill={isLikedByCurrentUser ? 'currentColor' : 'none'} />
						{likeCount > 0 && <span className="like-count">{likeCount}</span>}
					</button>
					<button
						className="action-button reply-button"
						onClick={() => onReply(msg.id, msg.userName)}
						disabled={!currentUserId}
					>
						<FiMessageSquare />
					</button>

					{}
					{onReport && !isOwnMessage && (
						<button
							className="action-button report-button"
							onClick={() => onReport(msg.id)}
							disabled={!currentUserId}
							title="Báo cáo vi phạm"
							style={{ marginLeft: '8px' }}
						>
							<FiFlag />
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
