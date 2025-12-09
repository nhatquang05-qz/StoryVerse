import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';
import { FiStar, FiImage, FiVideo, FiX } from 'react-icons/fi';
import '../../assets/styles/ReviewModal.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ReviewModalProps {
	isOpen: boolean;
	onClose: () => void;
	orderId: number;
	item: any;
	token: string;
	onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
	isOpen,
	onClose,
	orderId,
	item,
	token,
	onSuccess,
}) => {
	const { showToast } = useToast();

	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [images, setImages] = useState<File[]>([]);
	const [video, setVideo] = useState<File | null>(null);
	const [previewImgs, setPreviewImgs] = useState<string[]>([]);
	const [previewVid, setPreviewVid] = useState<string | null>(null);

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setRating(5);
			setComment('');
			setImages([]);
			setVideo(null);
			setPreviewImgs([]);
			setPreviewVid(null);
			setIsSubmitting(false);
		}
	}, [isOpen, item]);

	if (!isOpen || !item) return null;

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			if (images.length + files.length > 3) return showToast('Tối đa 3 ảnh', 'warning');
			const newImages = [...images, ...files];
			setImages(newImages);
			setPreviewImgs([...previewImgs, ...files.map((f) => URL.createObjectURL(f))]);
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
		const newImages = [...images];
		newImages.splice(index, 1);
		setImages(newImages);
		const newPreviews = [...previewImgs];
		URL.revokeObjectURL(newPreviews[index]);
		newPreviews.splice(index, 1);
		setPreviewImgs(newPreviews);
	};

	const removeVideo = () => {
		setVideo(null);
		if (previewVid) URL.revokeObjectURL(previewVid);
		setPreviewVid(null);
	};

	const uploadFileToBackend = async (file: File) => {
		const formData = new FormData();
		formData.append('image', file);
		formData.append('uploadType', 'review_media');
		const res = await axios.post(`${API_URL}/upload`, formData, {
			headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
		});
		return res.data.imageUrl;
	};

	const handleSubmit = async () => {
		if (isSubmitting) return;

		if (!item.comicId) return showToast('Lỗi dữ liệu sản phẩm', 'error');
		if (!comment.trim()) return showToast('Vui lòng nhập đánh giá', 'warning');

		setIsSubmitting(true);

		try {
			const imageUrls = await Promise.all(images.map((img) => uploadFileToBackend(img)));
			let videoUrl = null;
			if (video) videoUrl = await uploadFileToBackend(video);

			await axios.post(
				`${API_URL}/reviews/create`,
				{
					orderId: orderId,
					comicId: item.comicId,
					rating,
					comment,
					images: imageUrls,
					video: videoUrl,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			showToast('Đánh giá thành công!', 'success');
			onSuccess();
			onClose();
		} catch (error: any) {
			console.error('Submit Review Error:', error);
			const msg = error.response?.data?.message || 'Lỗi gửi đánh giá';
			if (msg.includes('đã đánh giá')) {
				showToast('Bạn đã đánh giá sản phẩm này rồi', 'info');
				onClose();
			} else {
				showToast(msg, 'error');
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="rm-overlay" onClick={onClose}>
			<div className="rm-container" onClick={(e) => e.stopPropagation()}>
				<div className="rm-header">
					<h3>Đánh giá: {item.title}</h3>
					<button className="rm-close" onClick={onClose}>
						<FiX />
					</button>
				</div>

				<div className="rm-body">
					<div
						className="rm-rating-group"
						style={{ justifyContent: 'center', padding: '10px 0' }}
					>
						{[1, 2, 3, 4, 5].map((star) => (
							<FiStar
								key={star}
								className={`rm-star ${star <= rating ? 'active' : ''}`}
								onClick={() => setRating(star)}
								fill={star <= rating ? 'currentColor' : 'none'}
								size={32}
							/>
						))}
					</div>

					<textarea
						className="rm-textarea"
						placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
						value={comment}
						onChange={(e) => setComment(e.target.value)}
					/>

					<div className="rm-media-upload">
						<label className={`rm-upload-btn ${images.length >= 3 ? 'disabled' : ''}`}>
							<FiImage /> Thêm ảnh ({images.length}/3)
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageChange}
								disabled={images.length >= 3}
								hidden
							/>
						</label>
						<label className={`rm-upload-btn ${video ? 'disabled' : ''}`}>
							<FiVideo /> Thêm video
							<input
								type="file"
								accept="video/*"
								onChange={handleVideoChange}
								disabled={!!video}
								hidden
							/>
						</label>
					</div>

					<div className="rm-previews">
						{previewImgs.map((src, i) => (
							<div key={i} className="rm-preview-item">
								<img src={src} alt="preview" />
								<button className="rm-remove-btn" onClick={() => removeImage(i)}>
									<FiX />
								</button>
							</div>
						))}
						{previewVid && (
							<div className="rm-preview-item video">
								<video src={previewVid} />
								<button className="rm-remove-btn" onClick={removeVideo}>
									<FiX />
								</button>
							</div>
						)}
					</div>
				</div>

				<div className="rm-footer">
					<button className="rm-btn cancel" onClick={onClose}>
						Hủy bỏ
					</button>
					<button
						className="rm-btn submit"
						onClick={handleSubmit}
						disabled={isSubmitting}
						style={{
							opacity: isSubmitting ? 0.6 : 1,
							cursor: isSubmitting ? 'not-allowed' : 'pointer',
						}}
					>
						{isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReviewModal;
