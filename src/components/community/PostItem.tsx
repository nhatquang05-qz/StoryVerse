import React from 'react';
import {
	FaThumbsUp,
	FaRegThumbsUp,
	FaCommentAlt,
	FaShare,
	FaEllipsisH,
	FaExclamationTriangle,
	FaTrash,
} from 'react-icons/fa';
import type { Post } from '../../types/community';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import '../../assets/styles/PostItem.css';

interface PostItemProps {
	post: Post;
	currentUser: any;
	onLike: (post: Post) => void;
	onToggleComments: (postId: number) => void;
	onDelete: (id: number) => void;
	onReport: (id: number) => void;
	onUserClick: (userId: string) => void;
	activeMenuId: { id: number; type: 'post' | 'comment' } | null;
	setActiveMenuId: (val: { id: number; type: 'post' | 'comment' } | null) => void;
	children?: React.ReactNode;
}

const getAvatarSrc = (url: string | null | undefined) => {
	if (!url || url === 'defaultAvatar.webp') return defaultAvatar;
	return url;
};

const PostItem: React.FC<PostItemProps> = ({
	post,
	currentUser,
	onLike,
	onToggleComments,
	onDelete,
	onReport,
	onUserClick,
	activeMenuId,
	setActiveMenuId,
	children,
}) => {
	const isOwner = Number(currentUser?.id) === post.userId;
	const showMenu = activeMenuId?.id === post.id && activeMenuId.type === 'post';

	return (
		<div className="post-item">
			<div className="post-header">
				<img
					src={getAvatarSrc(post.avatar)}
					className="post-avatar"
					alt="ava"
					onClick={() => onUserClick(String(post.userId))}
					style={{ cursor: 'pointer' }}
				/>
				<div className="post-info">
					<h4
						onClick={() => onUserClick(String(post.userId))}
						style={{ cursor: 'pointer' }}
					>
						{post.userName}
					</h4>
					<p className="post-time">{new Date(post.createdAt).toLocaleString('vi-VN')}</p>
				</div>
				<div className="post-options-wrapper">
					<button
						className="btn-options"
						onClick={(e) => {
							e.stopPropagation();
							setActiveMenuId(showMenu ? null : { id: post.id, type: 'post' });
						}}
					>
						<FaEllipsisH />
					</button>
					{showMenu && (
						<div className="post-options-menu">
							<div className="menu-item" onClick={() => onReport(post.id)}>
								<FaExclamationTriangle /> Báo cáo
							</div>
							{isOwner && (
								<div className="menu-item delete" onClick={() => onDelete(post.id)}>
									<FaTrash /> Xoá bài viết
								</div>
							)}
						</div>
					)}
				</div>
			</div>
			<div className="post-content">{post.content}</div>
			{post.imageUrl && (
				<div className="post-image-wrapper">
					<img src={post.imageUrl} className="post-image" alt="content" />
				</div>
			)}
			<div className="post-stats">
				<span>{post.likeCount} lượt thích</span>
				<span>{post.commentCount} bình luận</span>
			</div>
			<div className="post-actions-bar">
				<button
					className={`post-action-btn ${post.isLiked ? 'liked' : ''}`}
					onClick={() => onLike(post)}
				>
					{post.isLiked ? <FaThumbsUp /> : <FaRegThumbsUp />} <span>Thích</span>
				</button>
				<button className="post-action-btn" onClick={() => onToggleComments(post.id)}>
					<FaCommentAlt /> <span>Bình luận</span>
				</button>
				<button
					className="post-action-btn"
					onClick={() => {
						navigator.clipboard.writeText(window.location.href);
						alert('Đã sao chép liên kết!');
					}}
				>
					<FaShare /> <span>Chia sẻ</span>
				</button>
			</div>
			{children}
		</div>
	);
};
export default PostItem;
