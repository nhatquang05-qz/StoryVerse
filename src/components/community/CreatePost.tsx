import React from 'react';
import { FaCamera, FaSmile } from 'react-icons/fa';
import closeBtnIcon from '../../assets/images/close-btn.avif';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import '../../assets/styles/CreatePost.css';

interface CreatePostProps {
	currentUser: any;
	content: string;
	setContent: (val: string) => void;
	image: string | null;
	setImage: (val: string | null) => void;
	isUploading: boolean;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
	onShowStickerNotification: () => void;
}

const getAvatarSrc = (url: string | null | undefined) => {
	if (!url || url === 'defaultAvatar.webp') return defaultAvatar;
	return url;
};

const CreatePost: React.FC<CreatePostProps> = ({
	currentUser,
	content,
	setContent,
	image,
	setImage,
	isUploading,
	onUpload,
	onSubmit,
	onShowStickerNotification,
}) => {
	return (
		<div className="create-post-card">
			<div className="create-post-top">
				<img
					src={getAvatarSrc(currentUser?.avatarUrl)}
					className="current-user-avatar"
					alt="me"
				/>
				<input
					className="post-input-trigger"
					placeholder={`Bạn đang nghĩ gì, ${currentUser?.fullName}?`}
					value={content}
					onChange={(e) => setContent(e.target.value)}
				/>
			</div>
			{isUploading ? (
				<div className="uploading-preview">⏳ Đang tải ảnh lên...</div>
			) : (
				image && (
					<div className="image-upload-preview-container">
						<img src={image} alt="Preview" className="preview-img-upload" />
						<button className="btn-remove-img" onClick={() => setImage(null)}>
							<img src={closeBtnIcon} alt="Xóa" />
						</button>
					</div>
				)
			)}
			<div className="create-post-actions">
				<label className={`action-btn ${isUploading ? 'disabled' : ''}`}>
					<FaCamera className="icon photo-icon" /> Ảnh/Video
					<input
						type="file"
						hidden
						accept="image/*"
						onChange={onUpload}
						disabled={isUploading}
					/>
				</label>
				<div className="action-btn" onClick={onShowStickerNotification}>
					<FaSmile className="icon sticker-icon" /> Cảm xúc
				</div>
				<button
					className="btn-submit-post"
					onClick={onSubmit}
					disabled={(!content.trim() && !image) || isUploading}
				>
					Đăng
				</button>
			</div>
		</div>
	);
};
export default CreatePost;
