import React, { useRef } from 'react';
import { type User } from '../../types/userTypes';
import { FiImage, FiSmile, FiSend, FiX } from 'react-icons/fi';
import '../../assets/styles/CreatePost.css';

interface CreatePostProps {
	currentUser: User;
	content: string;
	setContent: (content: string) => void;
	image: string | null;
	setImage: (image: string | null) => void;
	isUploading: boolean;
	onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
	onShowStickerToast?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({
	currentUser,
	content,
	setContent,
	image,
	setImage,
	isUploading,
	onUpload,
	onSubmit,
	onShowStickerToast,
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onSubmit();
		}
	};

	return (
		<div className="create-post-card">
			<div className="cp-header">
				<img
					src={currentUser.avatarUrl || 'https://via.placeholder.com/150'}
					alt="User Avatar"
					className="cp-avatar"
				/>
				<div className="cp-input-wrapper">
					<textarea
						className="cp-textarea"
						placeholder={`Bạn đang nghĩ gì, ${currentUser.fullName}?`}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						onKeyDown={handleKeyDown}
						rows={1}
						style={{ height: 'auto', minHeight: '40px' }}
						onInput={(e) => {
							e.currentTarget.style.height = 'auto';
							e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
						}}
					/>
				</div>
			</div>

			{image && (
				<div className="cp-image-preview">
					<img src={image} alt="Preview" />
					<button className="cp-remove-img" onClick={() => setImage(null)}>
						<FiX />
					</button>
				</div>
			)}

			<div className="cp-footer">
				<div className="cp-actions">
					<button
						className="cp-action-btn"
						onClick={() => fileInputRef.current?.click()}
						disabled={isUploading}
					>
						<FiImage className="cp-icon" />
						<span>Ảnh/Video</span>
					</button>
					<input
						type="file"
						hidden
						ref={fileInputRef}
						accept="image/*"
						onChange={onUpload}
					/>

					<button className="cp-action-btn" onClick={onShowStickerToast}>
						<FiSmile className="cp-icon" />
						<span>Cảm xúc</span>
					</button>
				</div>

				<button
					className="cp-submit-btn"
					onClick={onSubmit}
					disabled={(!content.trim() && !image) || isUploading}
				>
					<FiSend /> Đăng
				</button>
			</div>
		</div>
	);
};

export default CreatePost;
