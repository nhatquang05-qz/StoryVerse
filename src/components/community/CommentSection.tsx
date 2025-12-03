import React from 'react';
import { FaCamera, FaSmile, FaPaperPlane, FaTimes } from 'react-icons/fa';
import StickerPicker from '../common/Chat/StickerPicker';
import CommentItem from './CommentItem';
import type { Post } from '../../types/community';
import closeBtnIcon from '../../assets/images/close-btn.avif';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import '../../assets/styles/CommentSection.css';

interface CommentSectionProps {
    post: Post;
    currentUser: any;
    commentContent: string;
    setCommentContent: (val: string) => void;
    commentImage: string | null;
    setCommentImage: (val: string | null) => void;
    commentSticker: string | null;
    setCommentSticker: (val: string | null) => void;
    isUploading: boolean;
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showStickerPicker: boolean;
    setShowStickerPicker: (val: boolean) => void;
    replyingToCommentId: number | null;
    setReplyingToCommentId: (val: number | null) => void;
    onSend: (postId: number) => void;
    
    onLikeComment: (postId: number, commentId: number) => void;
    onDeleteComment: (postId: number, commentId: number) => void;
    onReportComment: (id: number) => void;
    onUserClick: (userId: string) => void;
    activeMenuId: any;
    setActiveMenuId: any;
}

const getAvatarSrc = (url: string | null | undefined) => {
    if (!url || url === 'defaultAvatar.webp') return defaultAvatar;
    return url;
};

const CommentSection: React.FC<CommentSectionProps> = (props) => {
    const { post, replyingToCommentId, setReplyingToCommentId } = props;
    
    const rootComments = post.comments?.filter(c => !c.parentId) || [];
    const getReplies = (parentId: number) => post.comments?.filter(c => c.parentId === parentId) || [];

    const replyUser = post.comments?.find(c => c.id === replyingToCommentId)?.userName;

    return (
        <div className="comments-section">
            <div className="comments-list">
                {rootComments.map(comment => (
                    <div key={comment.id} className="comment-thread">
                        <CommentItem 
                            comment={comment} postId={post.id} currentUser={props.currentUser} 
                            onLike={props.onLikeComment} onReply={setReplyingToCommentId} 
                            onDelete={props.onDeleteComment} onReport={props.onReportComment}
                            onUserClick={props.onUserClick}
                            activeMenuId={props.activeMenuId} setActiveMenuId={props.setActiveMenuId}
                        />
                        <div className="comment-replies">
                            {getReplies(comment.id).map(reply => (
                                <CommentItem 
                                    key={reply.id} comment={reply} postId={post.id} currentUser={props.currentUser} isReply={true}
                                    onLike={props.onLikeComment} onReply={setReplyingToCommentId}
                                    onDelete={props.onDeleteComment} onReport={props.onReportComment}
                                    onUserClick={props.onUserClick}
                                    activeMenuId={props.activeMenuId} setActiveMenuId={props.setActiveMenuId}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="comment-input-area sticky-input">
                {replyingToCommentId && (
                     <div className="reply-input-indicator" style={{position:'absolute', top: '-35px', left: 40, right: 0}}>
                       <span>Đang trả lời <b>{replyUser}</b></span>
                       <button onClick={() => setReplyingToCommentId(null)}><FaTimes/></button>
                     </div>
                )}
                <img 
                    src={getAvatarSrc(props.currentUser?.avatarUrl)} 
                    className="comment-avatar" 
                    alt="me" 
                />
                <div className="comment-input-wrapper">
                    <input className="comment-input" 
                        placeholder={replyingToCommentId ? "Viết câu trả lời..." : "Viết bình luận..."} 
                        value={props.commentContent} 
                        onChange={e => props.setCommentContent(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && props.onSend(post.id)} 
                        autoFocus={!!replyingToCommentId} 
                        disabled={props.isUploading}
                    />
                    <div className="comment-actions-right">
                        <label className="mini-icon-btn"><FaCamera /><input type="file" hidden accept="image/*" onChange={props.onUpload} disabled={props.isUploading}/></label>
                        <button className="mini-icon-btn sticker-toggle-btn" onClick={(e) => {e.stopPropagation(); props.setShowStickerPicker(!props.showStickerPicker);}}>
                            <FaSmile />
                        </button>
                        <button className="mini-icon-btn send-btn" onClick={() => props.onSend(post.id)} disabled={(!props.commentContent.trim() && !props.commentImage && !props.commentSticker) || props.isUploading}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
                {props.showStickerPicker && (
                    <div className="sticker-popover">
                        <StickerPicker onStickerSelect={(s) => {props.setCommentSticker(s.url); props.setShowStickerPicker(false);}} onClose={() => props.setShowStickerPicker(false)} />
                    </div>
                )}
            </div>
            
            {props.isUploading ? <div className="comment-img-preview-box">⏳ Đang tải ảnh...</div> 
            : (props.commentImage || props.commentSticker) && (
                <div className="comment-img-preview-box">
                    <img src={props.commentImage || props.commentSticker || ''} alt="preview" style={props.commentSticker ? {width:80, height:80, objectFit:'contain'} : {}}/>
                    <button onClick={() => {props.setCommentImage(null); props.setCommentSticker(null);}} className="btn-remove-comment-img"><img src={closeBtnIcon} alt="Xóa" /></button>
                </div>
            )}
        </div>
    );
};
export default CommentSection;