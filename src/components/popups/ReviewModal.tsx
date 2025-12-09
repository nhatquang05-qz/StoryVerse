import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { FiStar, FiImage, FiVideo, FiX, FiTrash2 } from 'react-icons/fi';
import '../../assets/styles/ReviewModal.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    items: any[];
    token: string;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, orderId, items, token, onSuccess }) => {
    const { showToast } = useToast();
    
     
     
    const itemToReview = items && items.length > 0 ? items[0] : null;

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [video, setVideo] = useState<File | null>(null);
    const [previewImgs, setPreviewImgs] = useState<string[]>([]);
    const [previewVid, setPreviewVid] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !itemToReview) return null;

     
     
     
     
    const targetComicId = itemToReview.comicId || itemToReview.id; 
     
    console.log("Reviewing Comic ID:", targetComicId, "Item Data:", itemToReview);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 3) return showToast('Tối đa 3 ảnh', 'warning');
            
            const newImages = [...images, ...files];
            setImages(newImages);
            
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImgs([...previewImgs, ...newPreviews]);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) return showToast('Video < 50MB', 'warning');
            
            setVideo(file);
            setPreviewVid(URL.createObjectURL(file));
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images]; newImages.splice(index, 1); setImages(newImages);
        const newPreviews = [...previewImgs]; URL.revokeObjectURL(newPreviews[index]); newPreviews.splice(index, 1); setPreviewImgs(newPreviews);
    };

    const removeVideo = () => {
        setVideo(null); if (previewVid) URL.revokeObjectURL(previewVid); setPreviewVid(null);
    };

    const uploadFileToBackend = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('uploadType', 'review_media');
        
        const res = await axios.post(`${API_URL}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
        });
        return res.data.imageUrl;
    };

    const handleSubmit = async () => {
        if (!comment.trim()) return showToast('Nhập nội dung đánh giá', 'warning');
        setIsSubmitting(true);
        
        try {
            const imageUrls = await Promise.all(images.map(img => uploadFileToBackend(img)));
            let videoUrl = null;
            if (video) videoUrl = await uploadFileToBackend(video);

            await axios.post(`${API_URL}/reviews/create`, {
                orderId: orderId,
                comicId: targetComicId,  
                rating,
                comment,
                images: imageUrls,
                video: videoUrl
            }, { headers: { Authorization: `Bearer ${token}` } });

            showToast('Đánh giá thành công!', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Submit Review Error:", error);
            showToast(error.response?.data?.message || 'Lỗi gửi đánh giá', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="rm-overlay">
            <div className="rm-container">
                <div className="rm-header">
                    <h3>ĐÁNH GIÁ SẢN PHẨM</h3>
                    <button className="rm-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="rm-product-info">
                    <div className="rm-product-name">{itemToReview.title}</div>
                    
                    <div className="rm-rating-group">
                        {[1, 2, 3, 4, 5].map(star => (
                            <FiStar 
                                key={star} 
                                className={`rm-star ${star <= rating ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                                fill={star <= rating ? "currentColor" : "none"}
                            />
                        ))}
                    </div>
                </div>

                <textarea 
                    className="rm-textarea"
                    placeholder="Chất lượng sản phẩm thế nào? Hãy chia sẻ với mọi người..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />

                <div className="rm-upload-area">
                    <label className={`rm-upload-btn ${images.length >= 3 ? 'disabled' : ''}`}>
                        <FiImage /> Thêm ảnh ({images.length}/3)
                        <input type="file" accept="image/*" multiple onChange={handleImageChange} disabled={images.length >= 3} hidden />
                    </label>
                    <label className={`rm-upload-btn ${video ? 'disabled' : ''}`}>
                        <FiVideo /> Thêm video
                        <input type="file" accept="video/*" onChange={handleVideoChange} disabled={!!video} hidden />
                    </label>
                </div>

                <div className="rm-preview-list">
                    {previewImgs.map((src, i) => (
                        <div key={i} className="rm-preview-item">
                            <img src={src} className="rm-preview-img" alt="preview" />
                            <button className="rm-remove-btn" onClick={() => removeImage(i)}><FiX /></button>
                        </div>
                    ))}
                    {previewVid && (
                        <div className="rm-preview-item">
                            <video src={previewVid} className="rm-preview-video" />
                            <button className="rm-remove-btn" onClick={removeVideo}><FiX /></button>
                        </div>
                    )}
                </div>

                <div className="rm-actions">
                    <button className="rm-btn cancel" onClick={onClose}>Hủy bỏ</button>
                    <button className="rm-btn submit" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;