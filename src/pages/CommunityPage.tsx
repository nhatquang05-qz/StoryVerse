import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import CreatePost from '../components/community/CreatePost';
import PostItem from '../components/community/PostItem';
import CommentSection from '../components/community/CommentSection';
import ReportModal from '../components/community/ReportModal';
import type { Post } from '../types/community';
import '../assets/styles/CommunityPage.css';

const CommunityPage: React.FC = () => {
    const { currentUser, token } = useAuth();
    const { showNotification } = useNotification();
    const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

    useEffect(() => {
        fetchPosts();
        
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.post-options-menu') && !target.closest('.btn-options')) {
                setActiveMenuId(null);
            }
            if (!target.closest('.sticker-popover') && !target.closest('.sticker-toggle-btn')) {
                setShowStickerPicker(null);
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

    const handleOpenReport = (id: number, type: 'post' | 'comment') => {
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

    if (loading) return <div className="community-container" style={{textAlign:'center'}}>Đang tải bảng tin...</div>;

    return (
        <div className="community-container">
            {currentUser && (
                <CreatePost 
                    currentUser={currentUser}
                    content={newPostContent} setContent={setNewPostContent}
                    image={newPostImage} setImage={setNewPostImage}
                    isUploading={isUploadingPostImg}
                    onUpload={(e) => handleFileUpload(e, 'post')}
                    onSubmit={handleCreatePost}
                    onShowStickerNotification={() => showNotification('Tính năng sticker cho bài đăng sắp ra mắt!', 'info')}
                />
            )}

            {posts.map(post => (
                <PostItem 
                    key={post.id} 
                    post={post} 
                    currentUser={currentUser}
                    onLike={handlePostLike}
                    onToggleComments={toggleComments}
                    onDelete={handleDeletePost}
                    onReport={(id) => handleOpenReport(id, 'post')}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                >
                    {activeCommentPostId === post.id && (
                        <CommentSection 
                            post={post}
                            currentUser={currentUser}
                            commentContent={commentContent} setCommentContent={setCommentContent}
                            commentImage={commentImage} setCommentImage={setCommentImage}
                            commentSticker={commentSticker} setCommentSticker={setCommentSticker}
                            isUploading={isUploadingCommentImg}
                            onUpload={(e) => handleFileUpload(e, 'comment')}
                            showStickerPicker={showStickerPicker === post.id}
                            setShowStickerPicker={(show) => setShowStickerPicker(show ? post.id : null)}
                            replyingToCommentId={replyingToCommentId}
                            setReplyingToCommentId={setReplyingToCommentId}
                            onSend={handleSendComment}
                            onLikeComment={handleCommentLike}
                            onDeleteComment={handleDeleteComment}
                            onReportComment={(id) => handleOpenReport(id, 'comment')}
                            activeMenuId={activeMenuId}
                            setActiveMenuId={setActiveMenuId}
                        />
                    )}
                </PostItem>
            ))}

            <ReportModal 
                isOpen={showReportModal}
                targetType={reportTarget?.type}
                reason={reportReason}
                setReason={setReportReason}
                onClose={() => setShowReportModal(false)}
                onSubmit={submitReport}
            />
        </div>
    );
};

export default CommunityPage;