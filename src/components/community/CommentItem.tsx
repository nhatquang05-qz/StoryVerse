import React from 'react';
import { FaEllipsisH, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import type { Comment } from '../../types/community';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';

interface CommentItemProps {
    comment: Comment;
    postId: number;
    currentUser: any;
    isReply?: boolean;
    onLike: (postId: number, commentId: number) => void;
    onReply: (commentId: number) => void;
    onDelete: (postId: number, commentId: number) => void;
    onReport: (id: number) => void;
    onUserClick: (userId: string) => void;
    activeMenuId: {id: number, type: 'post' | 'comment'} | null;
    setActiveMenuId: (val: any) => void;
}

const getAvatarSrc = (url: string | null | undefined) => {
    if (!url || url === 'defaultAvatar.webp') return defaultAvatar;
    return url;
};

const CommentItem: React.FC<CommentItemProps> = ({ 
    comment, postId, currentUser, isReply, onLike, onReply, onDelete, onReport, onUserClick, activeMenuId, setActiveMenuId 
}) => {
    const isOwner = Number(currentUser?.id) === comment.userId;
    const showMenu = activeMenuId?.id === comment.id && activeMenuId.type === 'comment';

    return (
        <div className={`comment-item ${isReply ? 'reply-item' : ''}`}>
            <img 
                src={getAvatarSrc(comment.avatar)} 
                className="comment-avatar" 
                alt="u" 
                onClick={() => onUserClick(String(comment.userId))}
                style={{ cursor: 'pointer' }}
            />
            <div className="comment-content-block">
                <div className="comment-bubble-wrapper" style={{display:'flex', alignItems:'center', gap: 5}}>
                    <div className="comment-bubble">
                        <div 
                            className="comment-user"
                            onClick={() => onUserClick(String(comment.userId))}
                            style={{ cursor: 'pointer' }}
                        >
                            {comment.userName}
                        </div>
                        {comment.content && <div className="comment-text">{comment.content}</div>}
                        {comment.imageUrl && <img src={comment.imageUrl} className="comment-image-preview" alt="img" />}
                        {comment.stickerUrl && <img src={comment.stickerUrl} className="sticker-img" alt="sticker" />}
                    </div>
                    <div className="comment-menu-trigger" style={{position:'relative'}}>
                        <button className="btn-options small" onClick={(e) => { e.stopPropagation(); setActiveMenuId(showMenu ? null : {id: comment.id, type: 'comment'})}}>
                            <FaEllipsisH />
                        </button>
                        {showMenu && (
                            <div className="post-options-menu">
                                <div className="menu-item" onClick={() => onReport(comment.id)}>
                                    <FaExclamationTriangle /> Báo cáo
                                </div>
                                {isOwner && (
                                    <div className="menu-item delete" onClick={() => onDelete(postId, comment.id)}>
                                        <FaTrash /> Xoá bình luận
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="comment-actions-text">
                    <span className={`action-text ${comment.isLiked ? 'liked-text' : ''}`} onClick={() => onLike(postId, comment.id)}>
                        {comment.isLiked ? 'Đã thích' : 'Thích'}
                        {comment.likeCount > 0 && <span className="like-count-badge"> ({comment.likeCount})</span>}
                    </span>
                    <span className="action-text" onClick={() => onReply(comment.id)}>Phản hồi</span>
                    <span className="time-text">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        </div>
    );
};
export default CommentItem;