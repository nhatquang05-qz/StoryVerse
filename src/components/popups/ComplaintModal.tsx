import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { FiImage, FiVideo, FiX } from 'react-icons/fi';
import '../../assets/styles/ComplaintModal.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ComplaintModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: number;
    token: string;
    existingData?: any;
    onSuccess: () => void;
}

const ComplaintModal: React.FC<ComplaintModalProps> = ({ isOpen, onClose, orderId, token, existingData, onSuccess }) => {
    const { showToast } = useToast();
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [video, setVideo] = useState<File | null>(null);
    
    // State hiển thị preview
    const [previewImgs, setPreviewImgs] = useState<string[]>([]);
    const [previewVid, setPreviewVid] = useState<string | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form khi mở modal
    useEffect(() => {
        if (isOpen && !existingData) {
            setDescription('');
            setImages([]);
            setVideo(null);
            setPreviewImgs([]);
            setPreviewVid(null);
        }
    }, [isOpen, existingData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (images.length + files.length > 5) {
                showToast('Tối đa 5 ảnh minh chứng', 'warning');
                return;
            }
            setImages([...images, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImgs([...previewImgs, ...newPreviews]);
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 50 * 1024 * 1024) {
                showToast('Video không được quá 50MB', 'warning');
                return;
            }
            setVideo(file);
            setPreviewVid(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);

        const newPreviews = [...previewImgs];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviewImgs(newPreviews);
    };

    const handleRemoveVideo = () => {
        setVideo(null);
        if (previewVid) URL.revokeObjectURL(previewVid);
        setPreviewVid(null);
    };

    // Hàm upload sử dụng API backend
    const uploadToBackend = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file); // Backend multer bắt key 'image'
        formData.append('uploadType', 'complaint_media');

        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.imageUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return showToast('Vui lòng nhập mô tả vấn đề', 'warning');
        
        setIsSubmitting(true);
        try {
            // 1. Upload file lên server trước
            const imageUrls = await Promise.all(images.map(img => uploadToBackend(img)));
            let videoUrl = null;
            if (video) {
                videoUrl = await uploadToBackend(video);
            }

            // 2. Gửi dữ liệu khiếu nại
            await axios.post(`${API_URL}/complaints/create`, {
                orderId,
                description,
                images: imageUrls,
                video: videoUrl
            }, { headers: { Authorization: `Bearer ${token}` } });

            showToast('Gửi khiếu nại thành công', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Complaint Error:", error);
            showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // --- VIEW MODE: Xem chi tiết ---
    if (existingData) {
        const { status, description, images, video, adminReply } = existingData;
        let statusText = 'Đang chờ xử lý';
        let statusClass = 'pending';
        if (status === 'RESOLVED') { statusText = 'Thành công'; statusClass = 'resolved'; }
        if (status === 'REJECTED') { statusText = 'Đã từ chối'; statusClass = 'rejected'; }

        return (
            <div className="cm-overlay">
                <div className="cm-container">
                    <div className="cm-header">
                        <h3>{status === 'RESOLVED' ? 'KẾT QUẢ KHIẾU NẠI' : 'THÔNG TIN KHIẾU NẠI'}</h3>
                        <button className="cm-close-btn" onClick={onClose}><FiX /></button>
                    </div>
                    
                    <div className="cm-body">
                        <div className={`cm-status-badge ${statusClass}`}>{statusText}</div>
                        
                        <div className="cm-section">
                            <label>Mô tả:</label>
                            <div className="cm-text-content">{description}</div>
                        </div>

                        {(images || video) && (
                            <div className="cm-section">
                                <label>Minh chứng:</label>
                                <div className="cm-gallery">
                                    {images && JSON.parse(images).map((src: string, i: number) => (
                                        <img key={i} src={src} className="cm-thumb" alt="proof" />
                                    ))}
                                </div>
                                {video && <video src={video} controls className="cm-video-preview" />}
                            </div>
                        )}

                        {adminReply && (
                            <div className="cm-admin-reply">
                                <label>Phản hồi từ Admin:</label>
                                <p>{adminReply}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- CREATE MODE: Tạo mới ---
    return (
        <div className="cm-overlay">
            <div className="cm-container">
                <div className="cm-header">
                    <h3>GỬI KHIẾU NẠI</h3>
                    <button className="cm-close-btn" onClick={onClose}><FiX /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="cm-body">
                    <div className="cm-section">
                        <label>Mô tả vấn đề <span className="required">*</span></label>
                        <textarea 
                            className="cm-textarea" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Sản phẩm bị lỗi, sai mẫu, hư hỏng..."
                        />
                    </div>

                    <div className="cm-section">
                        <label>Hình ảnh & Video minh chứng</label>
                        <div className="cm-upload-group">
                            <label className={`cm-upload-btn ${images.length >= 5 ? 'disabled' : ''}`}>
                                <FiImage /> Thêm ảnh ({images.length}/5)
                                <input type="file" accept="image/*" multiple onChange={handleImageChange} hidden disabled={images.length >= 5}/>
                            </label>
                            <label className={`cm-upload-btn ${video ? 'disabled' : ''}`}>
                                <FiVideo /> Thêm video
                                <input type="file" accept="video/*" onChange={handleVideoChange} hidden disabled={!!video}/>
                            </label>
                        </div>

                        <div className="cm-gallery">
                            {previewImgs.map((src, i) => (
                                <div key={i} className="cm-preview-item">
                                    <img src={src} alt="preview" />
                                    <button type="button" className="cm-remove-btn" onClick={() => handleRemoveImage(i)}><FiX /></button>
                                </div>
                            ))}
                            {previewVid && (
                                <div className="cm-preview-item video">
                                    <video src={previewVid} />
                                    <button type="button" className="cm-remove-btn" onClick={handleRemoveVideo}><FiX /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="cm-footer">
                        <button type="button" className="cm-btn cancel" onClick={onClose}>Hủy bỏ</button>
                        <button type="submit" className="cm-btn submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComplaintModal;