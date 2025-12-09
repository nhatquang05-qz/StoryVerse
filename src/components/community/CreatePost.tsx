import React, { useRef } from 'react';
import { type User } from '../../types/userTypes';
import { FiImage, FiSmile, FiSend, FiX } from 'react-icons/fi';
import '../../assets/styles/CreatePost.css';
import defaultAvatar from '../../assets/images/defaultAvatar.webp'; 

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
            <div className="crp-header">
                <img
                    src={currentUser.avatarUrl || defaultAvatar}
                    alt="User Avatar"
                    className="crp-avatar"
                    onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                    }}
                />
                <div className="crp-input-wrapper">
                    <textarea
                        className="crp-textarea"
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
                <div className="crp-image-preview">
                    <img src={image} alt="Preview" />
                    <button className="crp-remove-img" onClick={() => setImage(null)}>
                        <FiX />
                    </button>
                </div>
            )}

            <div className="crp-footer">
                <div className="crp-actions">
                    <button
                        className="crp-action-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        <FiImage className="crp-icon" />
                        <span>Ảnh/Video</span>
                    </button>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={onUpload}
                    />

                    <button className="crp-action-btn" onClick={onShowStickerToast}>
                        <FiSmile className="crp-icon" />
                        <span>Cảm xúc</span>
                    </button>
                </div>

                <button
                    className="crp-submit-btn"
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