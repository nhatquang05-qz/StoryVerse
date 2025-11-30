import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import StickerPicker from '../components/common/Chat/StickerPicker';
import { 
    FaThumbsUp, FaRegThumbsUp, FaCommentAlt, FaShare, FaTrash, 
    FaEllipsisH, FaCamera, FaSmile, FaPaperPlane, FaExclamationTriangle, FaTimes
} from 'react-icons/fa';
import closeBtnIcon from '../assets/images/close-btn.png'; 
import '../assets/styles/CommunityPage.css';
import defaultAvatar from '../assets/images/defaultAvatar.png';

interface Comment {
    id: number;
    postId: number;
    userId: number;
    userName: string;
    avatar: string;
    content: string;
    imageUrl?: string;
    stickerUrl?: string;
    parentId?: number | null;
    createdAt: string;
    likeCount: number;
    isLiked: boolean;
}

interface Post {
    id: number;
    userId: number;
    userName: string;
    avatar: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likeCount: number;
    commentCount: number;
    isLiked: boolean;
    comments?: Comment[];
}

const CommunityPage: React.FC = () => {
    const { currentUser, token } = useAuth();
    const { showNotification } = useNotification();
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState<string | null>(null);
    const [isUploadingPostImg, setIsUploadingPostImg] = useState(false);

    const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [commentImage, setCommentImage] = useState<string | null>(null);
    const [commentSticker, setCommentSticker] = useState<string | null>(null); 
    const [isUploadingCommentImg, setIsUploadingCommentImg] = useState(false);
    const [showStickerPicker, setShowStickerPicker] = useState<number | null>(null);
    const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);

    const [activeMenuId, setActiveMenuId] = useState<{id: number, type: 'post' | 'comment'} | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState<{id: number, type: 'post' | 'comment'} | null>(null);
    const [reportReason, setReportReason] = useState('Spam');

    const menuRef = useRef<HTMLDivElement>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

    useEffect(() => {
        fetchPosts();
        
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
            if (stickerRef.current && !stickerRef.current.contains(event.target as Node)) {
                const target = event.target as Element;
                if (!target.closest('.sticker-toggle-btn')) {
                    setShowStickerPicker(null);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [token]);

    const fetchPosts = async () => {
        try {
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/posts`, { headers });
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const uploadToCloudinary = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                return data.imageUrl;
            } else {
                const errorData = await res.json();
                showNotification(errorData.error || 'Upload ảnh thất bại', 'error');
                return null;
            }
        } catch (error) {
            console.error(error);
            showNotification('Lỗi kết nối khi upload', 'error');
            return null;
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'post' | 'comment') => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';

        if (type === 'post') {
            setIsUploadingPostImg(true);
            const url = await uploadToCloudinary(file);
            if (url) setNewPostImage(url);
            setIsUploadingPostImg(false);
        } else {
            setIsUploadingCommentImg(true);
            const url = await uploadToCloudinary(file);
            if (url) setCommentImage(url);
            setIsUploadingCommentImg(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !newPostImage) return;
        if (isUploadingPostImg) {
            showNotification('Đang tải ảnh lên, vui lòng chờ...', 'warning');
            return;
        }

        try {
            const headers: HeadersInit = token ? { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            } : { 'Content-Type': 'application/json' };

            const res = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ content: newPostContent, imageUrl: newPostImage })
            });

            if (res.ok) {
                const newPost = await res.json();
                setPosts([newPost, ...posts]);
                setNewPostContent('');
                setNewPostImage(null);
                showNotification('Đăng bài thành công!', 'success');
            } else {
                showNotification('Đăng bài thất bại', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    const handlePostLike = async (post: Post) => {
        if (!token) {
            showNotification('Vui lòng đăng nhập để tương tác', 'warning');
            return;
        }
        const updatedPosts = posts.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    isLiked: !p.isLiked,
                    likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1
                };
            }
            return p;
        });
        setPosts(updatedPosts);
        try {
            await fetch(`${API_URL}/posts/${post.id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) { console.error(error); }
    };

    const handleDeletePost = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xoá bài viết này?')) return;
        try {
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: headers
            });
            if (res.ok) {
                setPosts(posts.filter(p => p.id !== id));
                showNotification('Đã xoá bài viết', 'success');
            } else {
                showNotification('Không thể xoá bài viết', 'error');
            }
        } catch(e) { showNotification('Lỗi xoá bài', 'error'); }
        setActiveMenuId(null);
    };

    const handleDeleteComment = async (postId: number, commentId: number) => {
        if (!window.confirm('Bạn có chắc muốn xoá bình luận này?')) return;
        try {
            const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
                method: 'DELETE',
                headers: headers
            });
            if (res.ok) {
                setPosts(prev => prev.map(p => {
                    if (p.id === postId && p.comments) {
                        return {
                            ...p,
                            commentCount: p.commentCount - 1,
                            comments: p.comments.filter(c => c.id !== commentId)
                        };
                    }
                    return p;
                }));
                showNotification('Đã xoá bình luận', 'success');
            } else {
                showNotification('Không thể xoá bình luận', 'error');
            }
        } catch(e) { showNotification('Lỗi xoá bình luận', 'error'); }
        setActiveMenuId(null);
    };

    const handleReport = (id: number, type: 'post' | 'comment') => {
        if (!token) {
            showNotification('Vui lòng đăng nhập để báo cáo', 'warning');
            return;
        }
        setReportTarget({ id, type });
        setShowReportModal(true);
        setActiveMenuId(null);
    };

    const submitReport = async () => {
        if (!reportTarget || !token) return;
        
        const url = reportTarget.type === 'post' 
            ? `${API_URL}/posts/${reportTarget.id}/report`
            : `${API_URL}/posts/comments/${reportTarget.id}/report`;
        
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: reportReason })
            });

            if (res.ok) {
                showNotification('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.', 'success');
                setShowReportModal(false);
                setReportTarget(null);
            } else {
                showNotification('Gửi báo cáo thất bại', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    const renderMenu = (id: number, type: 'post' | 'comment', ownerId: number) => {
        if (activeMenuId?.id !== id || activeMenuId?.type !== type) return null;
        const isOwner = Number(currentUser?.id) === ownerId;
        
        return (
            <div className="post-options-menu">
                <div className="menu-item" onClick={() => handleReport(id, type)}>
                    <FaExclamationTriangle /> Báo cáo
                </div>
                {isOwner && (
                    <div className="menu-item delete" onClick={() => type === 'post' ? handleDeletePost(id) : handleDeleteComment(activeCommentPostId!, id)}>
                        <FaTrash /> Xoá {type === 'post' ? 'bài viết' : 'bình luận'}
                    </div>
                )}
            </div>
        );
    };

    const handleCommentLike = async (postId: number, commentId: number) => {
        if (!token) {
            showNotification('Vui lòng đăng nhập', 'warning');
            return;
        }
        
        setPosts(prev => prev.map(p => {
            if (p.id === postId && p.comments) {
                return {
                    ...p,
                    comments: p.comments.map(c => {
                        if (c.id === commentId) {
                            return { ...c, isLiked: !c.isLiked, likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1 };
                        }
                        return c;
                    })
                };
            }
            return p;
        }));

        try {
            await fetch(`${API_URL}/posts/comments/${commentId}/like`, { 
                method: 'POST', 
                headers: { 'Authorization': `Bearer ${token}` } 
            });
        } catch (e) { console.error(e); }
    };

    const toggleComments = async (postId: number) => {
        if (activeCommentPostId === postId) {
            setActiveCommentPostId(null);
            setReplyingToCommentId(null);
            setCommentContent('');
            setCommentImage(null);
            setCommentSticker(null);
            setShowStickerPicker(null);
        } else {
            setActiveCommentPostId(postId);
            const post = posts.find(p => p.id === postId);
            if (!post?.comments) {
                try {
                    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
                    const res = await fetch(`${API_URL}/posts/${postId}/comments`, { headers });
                    if (res.ok) {
                        const comments = await res.json();
                        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments } : p));
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    };

    const handleSendComment = async (postId: number) => {
        if (!token) {
            showNotification('Vui lòng đăng nhập', 'warning');
            return;
        }
        if (!commentContent.trim() && !commentImage && !commentSticker) return;
        if (isUploadingCommentImg) return;

        try {
            const body = {
                content: commentContent,
                imageUrl: commentImage,
                stickerUrl: commentSticker,
                parentId: replyingToCommentId
            };

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const newComment = await res.json();
                setPosts(prev => prev.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            commentCount: p.commentCount + 1,
                            comments: [...(p.comments || []), newComment]
                        };
                    }
                    return p;
                }));
                setCommentContent('');
                setCommentImage(null);
                setCommentSticker(null);
                setShowStickerPicker(null);
                setReplyingToCommentId(null);
            }
        } catch (error) {
            showNotification('Lỗi gửi bình luận', 'error');
        }
    };

    const handleSelectSticker = (stickerUrl: string) => {
        setCommentSticker(stickerUrl);
        setShowStickerPicker(null);
    };

    const CommentItem: React.FC<{ comment: Comment, post: Post, isReply?: boolean }> = ({ comment, post, isReply }) => {
        return (
            <div className={`comment-item ${isReply ? 'reply-item' : ''}`}>
                <img src={comment.avatar || defaultAvatar} className="comment-avatar" alt="u" />
                <div className="comment-content-block">
                    <div className="comment-bubble-wrapper" style={{display:'flex', alignItems:'center', gap: 5}}>
                        <div className="comment-bubble">
                            <div className="comment-user">{comment.userName}</div>
                            {comment.content && <div className="comment-text">{comment.content}</div>}
                            {comment.imageUrl && <img src={comment.imageUrl} className="comment-image-preview" alt="img" />}
                            {comment.stickerUrl && <img src={comment.stickerUrl} className="sticker-img" alt="sticker" />}
                        </div>
                        <div className="comment-menu-trigger" style={{position:'relative'}}>
                            <button className="btn-options small" onClick={() => setActiveMenuId(activeMenuId?.id === comment.id ? null : {id: comment.id, type: 'comment'})}>
                                <FaEllipsisH />
                            </button>
                            {renderMenu(comment.id, 'comment', comment.userId)}
                        </div>
                    </div>
                    <div className="comment-actions-text">
                        <span className={`action-text ${comment.isLiked ? 'liked-text' : ''}`} onClick={() => handleCommentLike(post.id, comment.id)}>
                            {comment.isLiked ? 'Đã thích' : 'Thích'}
                            {comment.likeCount > 0 && <span className="like-count-badge"> ({comment.likeCount})</span>}
                        </span>
                        <span className="action-text" onClick={() => setReplyingToCommentId(comment.id)}>Phản hồi</span>
                        <span className="time-text">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderComments = (post: Post) => {
        if (!post.comments) return null;
        const rootComments = post.comments.filter(c => !c.parentId);
        const getReplies = (parentId: number) => post.comments?.filter(c => c.parentId === parentId) || [];

        return rootComments.map(comment => (
            <div key={comment.id} className="comment-thread">
                <CommentItem comment={comment} post={post} />
                <div className="comment-replies">
                    {getReplies(comment.id).map(reply => (
                        <CommentItem key={reply.id} comment={reply} post={post} isReply={true} />
                    ))}
                </div>
                {replyingToCommentId === comment.id && (
                     <div className="reply-input-indicator">
                        <span>Đang trả lời <b>{comment.userName}</b></span>
                        <button onClick={() => setReplyingToCommentId(null)}><FaTimes/></button>
                     </div>
                )}
            </div>
        ));
    };

    if (loading) return <div className="community-container" style={{textAlign:'center'}}>Đang tải bảng tin...</div>;

    return (
        <div className="community-container">
            {currentUser && (
                <div className="create-post-card">
                     <div className="create-post-top">
                        <img src={currentUser.avatarUrl || defaultAvatar} className="current-user-avatar" alt="me" />
                        <input className="post-input-trigger" placeholder={`Bạn đang nghĩ gì, ${currentUser.fullName}?`} value={newPostContent} onChange={e => setNewPostContent(e.target.value)}/>
                    </div>
                    {isUploadingPostImg ? <div className="uploading-preview">⏳ Đang tải ảnh lên...</div> 
                    : newPostImage && (
                        <div className="image-upload-preview-container">
                            <img src={newPostImage} alt="Preview" className="preview-img-upload" />
                            <button className="btn-remove-img" onClick={() => setNewPostImage(null)}>
                                <img src={closeBtnIcon} alt="Xóa" />
                            </button>
                        </div>
                    )}
                    <div className="create-post-actions">
                        <label className={`action-btn ${isUploadingPostImg ? 'disabled' : ''}`}>
                            <FaCamera className="icon photo-icon"/> Ảnh/Video
                            <input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'post')} disabled={isUploadingPostImg}/>
                        </label>
                        <div className="action-btn" onClick={() => showNotification('Tính năng sticker cho bài đăng sắp ra mắt!', 'info')}>
                            <FaSmile className="icon sticker-icon" /> Cảm xúc
                        </div>
                        <button className="btn-submit-post" onClick={handleCreatePost} disabled={(!newPostContent.trim() && !newPostImage) || isUploadingPostImg}>
                            Đăng
                        </button>
                    </div>
                </div>
            )}

            {posts.map(post => (
                <div key={post.id} className="post-item">
                    <div className="post-header">
                        <img src={post.avatar || defaultAvatar} className="post-avatar" alt="ava" />
                        <div className="post-info">
                            <h4>{post.userName}</h4>
                            <p className="post-time">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div className="post-options-wrapper" ref={activeMenuId?.id === post.id && activeMenuId.type === 'post' ? menuRef : null}>
                             <button className="btn-options" onClick={() => setActiveMenuId(activeMenuId?.id === post.id ? null : {id: post.id, type: 'post'})}>
                                <FaEllipsisH />
                            </button>
                            {renderMenu(post.id, 'post', post.userId)}
                        </div>
                    </div>
                    <div className="post-content">{post.content}</div>
                    {post.imageUrl && <div className="post-image-wrapper"><img src={post.imageUrl} className="post-image" alt="content"/></div>}
                    <div className="post-stats"><span>{post.likeCount} lượt thích</span><span>{post.commentCount} bình luận</span></div>
                    <div className="post-actions-bar">
                        <button className={`post-action-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => handlePostLike(post)}>
                            {post.isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />} <span>Thích</span>
                        </button>
                        <button className="post-action-btn" onClick={() => toggleComments(post.id)}>
                            <FaCommentAlt /> <span>Bình luận</span>
                        </button>
                        <button className="post-action-btn" onClick={() => {navigator.clipboard.writeText(window.location.href); showNotification('Đã sao chép liên kết!', 'info')}}>
                            <FaShare /> <span>Chia sẻ</span>
                        </button>
                    </div>

                    {activeCommentPostId === post.id && (
                        <div className="comments-section">
                            <div className="comments-list">{renderComments(post)}</div>
                            <div className="comment-input-area sticky-input">
                                <img src={currentUser?.avatarUrl || defaultAvatar} className="comment-avatar" alt="me" />
                                <div className="comment-input-wrapper">
                                    <input className="comment-input" placeholder={replyingToCommentId ? "Viết câu trả lời..." : "Viết bình luận..."} value={commentContent} onChange={e => setCommentContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendComment(post.id)} autoFocus={!!replyingToCommentId} disabled={isUploadingCommentImg}/>
                                    <div className="comment-actions-right">
                                        <label className="mini-icon-btn"><FaCamera /><input type="file" hidden accept="image/*" onChange={e => handleFileUpload(e, 'comment')} disabled={isUploadingCommentImg}/></label>
                                        <button className="mini-icon-btn sticker-toggle-btn" onClick={(e) => {e.stopPropagation(); setShowStickerPicker(showStickerPicker === post.id ? null : post.id);}}>
                                            <FaSmile />
                                        </button>
                                        <button className="mini-icon-btn send-btn" onClick={() => handleSendComment(post.id)} disabled={(!commentContent.trim() && !commentImage && !commentSticker) || isUploadingCommentImg}>
                                            <FaPaperPlane />
                                        </button>
                                    </div>
                                </div>
                                {showStickerPicker === post.id && (
                                    <div className="sticker-popover" ref={stickerRef}>
                                        <StickerPicker onStickerSelect={(s) => {setCommentSticker(s.url); setShowStickerPicker(null);}} onClose={() => setShowStickerPicker(null)} />
                                    </div>
                                )}
                            </div>
                            {isUploadingCommentImg ? <div className="comment-img-preview-box">⏳ Đang tải ảnh...</div> 
                            : (commentImage || commentSticker) && (
                                <div className="comment-img-preview-box">
                                    <img src={commentImage || commentSticker || ''} alt="preview" style={commentSticker ? {width:80, height:80, objectFit:'contain'} : {}}/>
                                    <button onClick={() => {setCommentImage(null); setCommentSticker(null);}} className="btn-remove-comment-img"><img src={closeBtnIcon} alt="Xóa" /></button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="report-modal" onClick={e => e.stopPropagation()}>
                        <div className="report-title">Báo cáo {reportTarget?.type === 'post' ? 'bài viết' : 'bình luận'}</div>
                        <div className="report-options">
                            {['Spam', 'Nội dung phản cảm', 'Quấy rối', 'Thông tin sai lệch', 'Khác'].map(r => (
                                <label key={r} style={{display:'block', marginBottom: 10, cursor:'pointer'}}>
                                    <input type="radio" name="reportReason" value={r} checked={reportReason === r} onChange={(e) => setReportReason(e.target.value)} style={{marginRight: 8}}/>{r}
                                </label>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowReportModal(false)}>Huỷ</button>
                            <button className="btn-confirm" onClick={submitReport}>Gửi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunityPage;