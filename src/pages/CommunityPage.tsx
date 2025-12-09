import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import CreatePost from '../components/community/CreatePost';
import PostItem from '../components/community/PostItem';
import CommentSection from '../components/community/CommentSection';
import ReportModal from '../components/community/ReportModal';
import UserDetailModal from '../components/common/UserDetailModal';
import ConfirmModal from '../components/popups/ConfirmModal';
import CommunitySidebarLeft from '../components/community/CommunitySidebarLeft';
import CommunitySidebarRight from '../components/community/CommunitySidebarRight';
import { FiClock, FiTrendingUp, FiInbox } from 'react-icons/fi';
import type { Post } from '../types/community';
import '../assets/styles/CommunityModern.css';

const CommunityPage: React.FC = () => {
	const { currentUser, token, openLoginRequest } = useAuth();
	const { showToast } = useToast();
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
	const [activeMenuId, setActiveMenuId] = useState<{
		id: number;
		type: 'post' | 'comment';
	} | null>(null);
	const [showReportModal, setShowReportModal] = useState(false);
	const [reportTarget, setReportTarget] = useState<{
		id: number;
		type: 'post' | 'comment';
	} | null>(null);
	const [reportReason, setReportReason] = useState('Spam');
	const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<{
		id: number;
		type: 'post' | 'comment';
		parentId?: number;
	} | null>(null);

	const [feedFilter, setFeedFilter] = useState<'new' | 'hot'>('new');

	const handleUserClick = (userId: string) => {
		setSelectedUserProfileId(userId);
		setIsUserModalOpen(true);
	};

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
			const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
			const res = await fetch(`${API_URL}/posts`, { headers });
			if (res.ok) {
				const data = await res.json();
				setPosts(Array.isArray(data) ? data : []);
			} else {
				setPosts([]);
			}
		} catch (error) {
			console.error('Error fetching posts:', error);
			setPosts([]);
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
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			if (res.ok) {
				const data = await res.json();
				return data.imageUrl;
			} else {
				const errorData = await res.json();
				showToast(errorData.error || 'Upload ảnh thất bại', 'error');
				return null;
			}
		} catch (error) {
			console.error(error);
			showToast('Lỗi kết nối khi upload', 'error');
			return null;
		}
	};

	const handleFileUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
		type: 'post' | 'comment',
	) => {
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
			showToast('Đang tải ảnh lên, vui lòng chờ...', 'warning');
			return;
		}
		try {
			const headers: HeadersInit = token
				? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
				: { 'Content-Type': 'application/json' };
			const res = await fetch(`${API_URL}/posts`, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({ content: newPostContent, imageUrl: newPostImage }),
			});
			if (res.ok) {
				const newPost = await res.json();
				setPosts([newPost, ...posts]);
				setNewPostContent('');
				setNewPostImage(null);
				showToast('Đăng bài thành công!', 'success');
			} else {
				showToast('Đăng bài thất bại', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối', 'error');
		}
	};

	const handlePostLike = async (post: Post) => {
		if (!token) {
			openLoginRequest();
			return;
		}
		const updatedPosts = posts.map((p) => {
			if (p.id === post.id) {
				return {
					...p,
					isLiked: !p.isLiked,
					likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
				};
			}
			return p;
		});
		setPosts(updatedPosts);
		try {
			await fetch(`${API_URL}/posts/${post.id}/like`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeletePostClick = (id: number) => {
		setDeleteTarget({ id, type: 'post' });
		setActiveMenuId(null);
	};

	const handleDeleteCommentClick = (postId: number, commentId: number) => {
		setDeleteTarget({ id: commentId, type: 'comment', parentId: postId });
		setActiveMenuId(null);
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget || !token) return;
		const { id, type, parentId } = deleteTarget;
		const headers: HeadersInit = { Authorization: `Bearer ${token}` };
		try {
			if (type === 'post') {
				const res = await fetch(`${API_URL}/posts/${id}`, {
					method: 'DELETE',
					headers: headers,
				});
				if (res.ok) {
					setPosts(posts.filter((p) => p.id !== id));
					showToast('Đã xoá bài viết', 'success');
				} else {
					showToast('Không thể xoá bài viết', 'error');
				}
			} else if (type === 'comment' && parentId) {
				const res = await fetch(`${API_URL}/posts/comments/${id}`, {
					method: 'DELETE',
					headers: headers,
				});
				if (res.ok) {
					setPosts((prev) =>
						prev.map((p) => {
							if (p.id === parentId && p.comments) {
								return {
									...p,
									commentCount: p.commentCount - 1,
									comments: p.comments.filter((c) => c.id !== id),
								};
							}
							return p;
						}),
					);
					showToast('Đã xoá bình luận', 'success');
				} else {
					showToast('Không thể xoá bình luận', 'error');
				}
			}
		} catch (e) {
			showToast('Lỗi khi xóa', 'error');
		}
		setDeleteTarget(null);
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
			const post = posts.find((p) => p.id === postId);
			if (!post?.comments) {
				try {
					const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
					const res = await fetch(`${API_URL}/posts/${postId}/comments`, { headers });
					if (res.ok) {
						const comments = await res.json();
						setPosts((prev) =>
							prev.map((p) => (p.id === postId ? { ...p, comments } : p)),
						);
					}
				} catch (error) {
					console.error(error);
				}
			}
		}
	};

	const handleSendComment = async (postId: number) => {
		if (!token) {
			openLoginRequest();
			return;
		}
		if (!commentContent.trim() && !commentImage && !commentSticker) return;
		if (isUploadingCommentImg) return;
		try {
			const body = {
				content: commentContent,
				imageUrl: commentImage,
				stickerUrl: commentSticker,
				parentId: replyingToCommentId,
			};
			const headers: HeadersInit = {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			};
			const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(body),
			});
			if (res.ok) {
				const newComment = await res.json();
				setPosts((prev) =>
					prev.map((p) => {
						if (p.id === postId) {
							return {
								...p,
								commentCount: p.commentCount + 1,
								comments: [...(p.comments || []), newComment],
							};
						}
						return p;
					}),
				);
				setCommentContent('');
				setCommentImage(null);
				setCommentSticker(null);
				setShowStickerPicker(null);
				setReplyingToCommentId(null);
			}
		} catch (error) {
			showToast('Lỗi gửi bình luận', 'error');
		}
	};

	const handleCommentLike = async (postId: number, commentId: number) => {
		if (!token) {
			openLoginRequest();
			return;
		}
		setPosts((prev) =>
			prev.map((p) => {
				if (p.id === postId && p.comments) {
					return {
						...p,
						comments: p.comments.map((c) => {
							if (c.id === commentId) {
								return {
									...c,
									isLiked: !c.isLiked,
									likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
								};
							}
							return c;
						}),
					};
				}
				return p;
			}),
		);
		try {
			await fetch(`${API_URL}/posts/comments/${commentId}/like`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});
		} catch (e) {
			console.error(e);
		}
	};

	const handleOpenReport = (id: number, type: 'post' | 'comment') => {
		if (!token) {
			openLoginRequest();
			return;
		}
		setReportTarget({ id, type });
		setShowReportModal(true);
		setActiveMenuId(null);
	};

	const submitReport = async () => {
		if (!reportTarget || !token) return;
		const url =
			reportTarget.type === 'post'
				? `${API_URL}/posts/${reportTarget.id}/report`
				: `${API_URL}/posts/comments/${reportTarget.id}/report`;
		try {
			const res = await fetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
				body: JSON.stringify({ reason: reportReason }),
			});
			if (res.ok) {
				showToast('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét.', 'success');
				setShowReportModal(false);
				setReportTarget(null);
			} else {
				showToast('Gửi báo cáo thất bại', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối', 'error');
		}
	};

	const sortedPosts = [...posts].sort((a, b) => {
		if (feedFilter === 'hot') {
			const scoreA = (a.likeCount || 0) + (a.commentCount || 0);
			const scoreB = (b.likeCount || 0) + (b.commentCount || 0);
			return scoreB - scoreA;
		}

		return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
	});

	return (
		<div className="comm-layout">
			{}
			<CommunitySidebarLeft />

			{}
			<main className="comm-feed">
				{}
				<div className="comm-filter-bar">
					<button
						className={`comm-filter-btn ${feedFilter === 'new' ? 'active' : ''}`}
						onClick={() => setFeedFilter('new')}
					>
						<FiClock /> Mới Nhất
					</button>
					<button
						className={`comm-filter-btn ${feedFilter === 'hot' ? 'active' : ''}`}
						onClick={() => setFeedFilter('hot')}
					>
						<FiTrendingUp /> Phổ Biến
					</button>
				</div>

				{currentUser && (
					<CreatePost
						currentUser={currentUser}
						content={newPostContent}
						setContent={setNewPostContent}
						image={newPostImage}
						setImage={setNewPostImage}
						isUploading={isUploadingPostImg}
						onUpload={(e) => handleFileUpload(e, 'post')}
						onSubmit={handleCreatePost}
						onShowStickerToast={() =>
							showToast('Tính năng sticker cho bài đăng sắp ra mắt!', 'info')
						}
					/>
				)}

				{loading ? (
					<div
						style={{
							textAlign: 'center',
							padding: 40,
							color: 'var(--clr-text-secondary)',
						}}
					>
						Đang tải bảng tin...
					</div>
				) : sortedPosts.length > 0 ? (
					sortedPosts.map((post) => (
						<div
							key={post.id}
							className="comm-card"
							style={{
								padding: 0,
								overflow: 'hidden',
								border: '1px solid var(--clr-border-light)',
							}}
						>
							<PostItem
								post={post}
								currentUser={currentUser}
								onLike={handlePostLike}
								onToggleComments={toggleComments}
								onDelete={handleDeletePostClick}
								onReport={(id) => handleOpenReport(id, 'post')}
								onUserClick={handleUserClick}
								activeMenuId={activeMenuId}
								setActiveMenuId={setActiveMenuId}
							>
								{activeCommentPostId === post.id && (
									<CommentSection
										post={post}
										currentUser={currentUser}
										commentContent={commentContent}
										setCommentContent={setCommentContent}
										commentImage={commentImage}
										setCommentImage={setCommentImage}
										commentSticker={commentSticker}
										setCommentSticker={setCommentSticker}
										isUploading={isUploadingCommentImg}
										onUpload={(e) => handleFileUpload(e, 'comment')}
										showStickerPicker={showStickerPicker === post.id}
										setShowStickerPicker={(show) =>
											setShowStickerPicker(show ? post.id : null)
										}
										replyingToCommentId={replyingToCommentId}
										setReplyingToCommentId={setReplyingToCommentId}
										onSend={handleSendComment}
										onLikeComment={handleCommentLike}
										onDeleteComment={handleDeleteCommentClick}
										onReportComment={(id) => handleOpenReport(id, 'comment')}
										onUserClick={handleUserClick}
										activeMenuId={activeMenuId}
										setActiveMenuId={setActiveMenuId}
									/>
								)}
							</PostItem>
						</div>
					))
				) : (
					<div className="comm-empty-state">
						<FiInbox className="comm-empty-icon" />
						<h3>Chưa có bài đăng nào.</h3>
						<p>Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
					</div>
				)}
			</main>

			{}
			<CommunitySidebarRight />

			{}
			<ReportModal
				isOpen={showReportModal}
				targetType={reportTarget?.type}
				reason={reportReason}
				setReason={setReportReason}
				onClose={() => setShowReportModal(false)}
				onSubmit={submitReport}
			/>

			<ConfirmModal
				isOpen={!!deleteTarget}
				title={deleteTarget?.type === 'post' ? 'Xóa bài viết?' : 'Xóa bình luận?'}
				message="Hành động này không thể hoàn tác."
				confirmText="Xóa"
				cancelText="Hủy"
				isDestructive={true}
				onClose={() => setDeleteTarget(null)}
				onConfirm={handleConfirmDelete}
			/>

			<UserDetailModal
				userId={selectedUserProfileId}
				isOpen={isUserModalOpen}
				onClose={() => setIsUserModalOpen(false)}
			/>
		</div>
	);
};

export default CommunityPage;
