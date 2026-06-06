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

const ComplaintModal: React.FC<ComplaintModalProps> = ({
	isOpen,
	onClose,
	orderId,
	token,
	existingData,
	onSuccess,
}) => {
	const { showToast } = useToast();
	const [description, setDescription] = useState('');
	const [images, setImages] = useState<File[]>([]);
	const [video, setVideo] = useState<File | null>(null);
	const [previewImgs, setPreviewImgs] = useState<string[]>([]);
	const [previewVid, setPreviewVid] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (isOpen && !existingData) {
			setDescription('');
			setImages([]);
			setVideo(null);
			setPreviewImgs([]);
			setPreviewVid(null);
			setIsSubmitting(false);
		}
	}, [isOpen, existingData]);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			if (images.length + files.length > 5) return showToast('Tối đa 5 ảnh', 'warning');
			setImages([...images, ...files]);
			setPreviewImgs([...previewImgs, ...files.map((file) => URL.createObjectURL(file))]);
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

	const removeMedia = (index: number, type: 'image' | 'video') => {
		if (type === 'image') {
			const newImgs = [...images];
			newImgs.splice(index, 1);
			setImages(newImgs);
			const newPre = [...previewImgs];
			URL.revokeObjectURL(newPre[index]);
			newPre.splice(index, 1);
			setPreviewImgs(newPre);
		} else {
			setVideo(null);
			if (previewVid) URL.revokeObjectURL(previewVid);
			setPreviewVid(null);
		}
	};

	const uploadToBackend = async (file: File) => {
		const formData = new FormData();
		formData.append('image', file);
		formData.append('uploadType', 'complaint_media');
		const res = await axios.post(`${API_URL}/upload`, formData, {
			headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
		});
		return res.data.imageUrl;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;
		if (!description.trim()) return showToast('Vui lòng nhập mô tả', 'warning');

		setIsSubmitting(true);
		try {
			const imageUrls = await Promise.all(images.map((img) => uploadToBackend(img)));
			let videoUrl = null;
			if (video) videoUrl = await uploadToBackend(video);

			await axios.post(
				`${API_URL}/complaints/create`,
				{
					orderId,
					description,
					images: imageUrls,
					video: videoUrl,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			showToast('Gửi khiếu nại thành công', 'success');
			onSuccess();
			onClose();
		} catch (error: any) {
			console.error('Complaint Error:', error);
			showToast(error.response?.data?.message || 'Lỗi gửi khiếu nại', 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	if (existingData) {
		let proofImages: string[] = [];
		try {
			proofImages =
				typeof existingData.images === 'string'
					? JSON.parse(existingData.images)
					: existingData.images || [];
		} catch (e) {
			proofImages = [];
		}

		return (
			<div className="cm-overlay" onClick={onClose}>
				<div className="cm-container" onClick={(e) => e.stopPropagation()}>
					<div className="cm-header">
						<h3>CHI TIẾT KHIẾU NẠI</h3>
						<button className="cm-close-btn" onClick={onClose}>
							<FiX />
						</button>
					</div>

					<div className="cm-body">
						<div className={`cm-status-badge ${existingData.status?.toLowerCase()}`}>
							{existingData.status === 'PENDING'
								? 'Đang chờ xử lý'
								: existingData.status === 'RESOLVED'
									? 'Đã giải quyết'
									: 'Đã từ chối'}
						</div>

						<div className="cm-section">
							<label>Nội dung:</label>
							<div className="cm-text-content">{existingData.description}</div>
						</div>

						{(proofImages.length > 0 || existingData.video) && (
							<div className="cm-section">
								<label>Minh chứng:</label>
								<div className="cm-gallery">
									{proofImages.map((src, i) => (
										<div key={i} className="cm-preview-item">
											<img src={src} alt="proof" />
										</div>
									))}
									{existingData.video && (
										<div className="cm-preview-item video">
											<video src={existingData.video} controls />
										</div>
									)}
								</div>
							</div>
						)}

						{existingData.adminReply && (
							<div className="cm-admin-reply">
								<label>Phản hồi từ Admin:</label>
								<p>{existingData.adminReply}</p>
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="cm-overlay" onClick={onClose}>
			<div className="cm-container" onClick={(e) => e.stopPropagation()}>
				<div className="cm-header">
					<h3>GỬI KHIẾU NẠI</h3>
					<button className="cm-close-btn" onClick={onClose}>
						<FiX />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="cm-body">
					<div className="cm-section">
						<label>
							Mô tả vấn đề <span className="required">*</span>
						</label>
						<textarea
							className="cm-textarea"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Sản phẩm bị lỗi, hư hỏng..."
						/>
					</div>

					<div className="cm-section">
						<label>Minh chứng (Ảnh/Video)</label>
						<div className="cm-upload-group">
							<label
								className={`cm-upload-btn ${images.length >= 5 ? 'disabled' : ''}`}
							>
								<FiImage /> Thêm ảnh ({images.length}/5)
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleImageChange}
									hidden
									disabled={images.length >= 5}
								/>
							</label>
							<label className={`cm-upload-btn ${video ? 'disabled' : ''}`}>
								<FiVideo /> Thêm video
								<input
									type="file"
									accept="video/*"
									onChange={handleVideoChange}
									hidden
									disabled={!!video}
								/>
							</label>
						</div>

						<div className="cm-gallery">
							{previewImgs.map((src, i) => (
								<div key={i} className="cm-preview-item">
									<img src={src} alt="preview" />
									<button
										type="button"
										className="cm-remove-btn"
										onClick={() => removeMedia(i, 'image')}
									>
										<FiX />
									</button>
								</div>
							))}
							{previewVid && (
								<div className="cm-preview-item video">
									<video src={previewVid} />
									<button
										type="button"
										className="cm-remove-btn"
										onClick={() => removeMedia(0, 'video')}
									>
										<FiX />
									</button>
								</div>
							)}
						</div>
					</div>

					<div className="cm-footer">
						<button type="button" className="cm-btn cancel" onClick={onClose}>
							Hủy bỏ
						</button>
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
