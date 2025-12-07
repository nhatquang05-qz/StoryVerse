import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import {
	FiSave,
	FiTrash2,
	FiArrowLeft,
	FiArrowRight,
	FiPlus,
	FiRefreshCw,
	FiDownload,
} from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface EditChapterFormProps {
	comicId: number;
	comicTitle: string;
	chapterId: number;
	chapterNumber: number | string;
	initialContentUrls: string[];
	onCancel: () => void;
	onSuccess: () => void;
}

interface ChapterImage {
	id: string;
	type: 'url' | 'file';
	src: string;
	file?: File;
}

const EditChapterForm: React.FC<EditChapterFormProps> = ({
	comicId,
	comicTitle,
	chapterId,
	chapterNumber,
	initialContentUrls,
	onCancel,
	onSuccess,
}) => {
	const { showToast } = useToast();
	const [images, setImages] = useState<ChapterImage[]>([]);
	const [isSaving, setIsSaving] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);

	useEffect(() => {
		const loadedImages: ChapterImage[] = initialContentUrls.map((url, idx) => ({
			id: `existing-${idx}-${Date.now()}`,
			type: 'url',
			src: url,
		}));
		setImages(loadedImages);
	}, [initialContentUrls]);

	useEffect(() => {
		return () => {
			images.forEach((img) => {
				if (img.type === 'file') URL.revokeObjectURL(img.src);
			});
		};
	}, []);

	const handleDownloadImage = async (url: string, index: number) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;

			a.download = `${comicTitle}-Chap${chapterNumber}-Page${index + 1}.jpg`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(blobUrl);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Download failed:', error);
			window.open(url, '_blank');
		}
	};

	const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files.length > 0) {
			const newImages: ChapterImage[] = Array.from(e.target.files).map((file) => ({
				id: `new-${Math.random().toString(36).substr(2, 9)}`,
				type: 'file',
				src: URL.createObjectURL(file),
				file: file,
			}));
			setImages((prev) => [...prev, ...newImages]);
		}
		e.target.value = '';
	};

	const handleReplaceImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setImages((prev) => {
				const newImages = [...prev];
				if (newImages[index].type === 'file') URL.revokeObjectURL(newImages[index].src);

				newImages[index] = {
					id: `replaced-${Math.random()}`,
					type: 'file',
					src: URL.createObjectURL(file),
					file: file,
				};
				return newImages;
			});
		}
		e.target.value = '';
	};

	const handleDeleteImage = (index: number) => {
		setImages((prev) => {
			const newImages = [...prev];
			if (newImages[index].type === 'file') URL.revokeObjectURL(newImages[index].src);
			newImages.splice(index, 1);
			return newImages;
		});
	};

	const moveImage = (index: number, direction: 'left' | 'right') => {
		if (direction === 'left' && index === 0) return;
		if (direction === 'right' && index === images.length - 1) return;

		setImages((prev) => {
			const newImages = [...prev];
			const targetIndex = direction === 'left' ? index - 1 : index + 1;
			[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
			return newImages;
		});
	};

	const handleSave = async () => {
		if (images.length === 0) {
			showToast('Vui lòng thêm ít nhất một ảnh cho chương!', 'warning');
			return;
		}

		setIsSaving(true);
		setUploadProgress(0);
		const token = localStorage.getItem('storyverse_token');

		try {
			const imagesToUpload = images.filter((img) => img.type === 'file');
			const totalUploads = imagesToUpload.length;

			const uploadedMap: Record<string, string> = {};
			let completed = 0;

			for (const img of imagesToUpload) {
				if (!img.file) continue;

				const formData = new FormData();
				formData.append('image', img.file);
				formData.append('uploadType', 'chapter_content');
				formData.append('comicName', comicTitle);
				formData.append('chapterNumber', String(chapterNumber));

				const res = await fetch(`${API_BASE_URL}/upload`, {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				});

				if (!res.ok) throw new Error('Lỗi upload ảnh lên Cloudinary');
				const data = await res.json();

				if (!data.imageUrl) {
					throw new Error('Server không trả về URL ảnh sau khi upload');
				}

				uploadedMap[img.id] = data.imageUrl;
				completed++;
				setUploadProgress(totalUploads > 0 ? (completed / totalUploads) * 100 : 100);
			}

			const finalUrls = images
				.map((img) => {
					if (img.type === 'url') return img.src;

					return uploadedMap[img.id];
				})
				.filter((url): url is string => !!url && url.length > 0);

			const updateRes = await fetch(
				`${API_BASE_URL}/comics/${comicId}/chapters/${chapterId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ contentUrls: finalUrls }),
				},
			);

			if (!updateRes.ok) {
				const errData = await updateRes.json();
				throw new Error(errData.error || 'Lỗi cập nhật nội dung chương');
			}

			showToast('Đã cập nhật nội dung chương thành công!', 'success');
			onSuccess();
		} catch (error: any) {
			console.error('Save chapter error:', error);
			showToast(`Lỗi: ${error.message}`, 'error');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="admin-form-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '20px',
				}}
			>
				<button className="admin-back-btn" onClick={onCancel}>
					<FiArrowLeft /> Quay lại
				</button>
				<h2>Quản lý ảnh: Chương {chapterNumber}</h2>
				<button
					className="mgmt-btn add"
					onClick={handleSave}
					disabled={isSaving}
					style={{ padding: '10px 20px' }}
				>
					{isSaving ? (
						`Đang xử lý (${uploadProgress.toFixed(0)}%)...`
					) : (
						<>
							<FiSave /> Lưu Toàn Bộ
						</>
					)}
				</button>
			</div>

			<div className="admin-form" style={{ maxWidth: '100%' }}>
				<div
					style={{
						marginBottom: '20px',
						padding: '10px',
						background: '#f5f5f5',
						borderRadius: '8px',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
					}}
				>
					<div>
						<strong>Tổng số trang: {images.length}</strong>
					</div>
					<div>
						<input
							type="file"
							id="add-chapter-images"
							multiple
							accept="image/*"
							onChange={handleAddImages}
							style={{ display: 'none' }}
						/>
						<label
							htmlFor="add-chapter-images"
							className="mgmt-btn edit"
							style={{
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '5px',
							}}
						>
							<FiPlus /> Thêm ảnh vào cuối
						</label>
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
						gap: '20px',
						maxHeight: '70vh',
						overflowY: 'auto',
						padding: '10px',
					}}
				>
					{images.map((img, index) => (
						<div
							key={img.id}
							style={{
								border: '1px solid #ddd',
								borderRadius: '8px',
								padding: '10px',
								background: img.type === 'file' ? '#e6fffb' : '#fff',
								position: 'relative',
							}}
						>
							<div
								style={{
									position: 'absolute',
									top: '5px',
									left: '5px',
									background: 'rgba(0,0,0,0.7)',
									color: '#fff',
									padding: '2px 8px',
									borderRadius: '4px',
									fontSize: '12px',
									zIndex: 2,
								}}
							>
								#{index + 1}
							</div>

							<button
								type="button"
								onClick={() => handleDownloadImage(img.src, index)}
								style={{
									position: 'absolute',
									top: '5px',
									right: '5px',
									background: 'rgba(255, 255, 255, 0.9)',
									border: '1px solid #ccc',
									borderRadius: '50%',
									width: '30px',
									height: '30px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									cursor: 'pointer',
									zIndex: 2,
									color: '#333',
								}}
								title="Tải ảnh này"
							>
								<FiDownload size={14} />
							</button>

							<div
								style={{
									height: '250px',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									background: '#333',
									borderRadius: '4px',
									marginBottom: '10px',
									overflow: 'hidden',
								}}
							>
								<img
									src={img.src}
									alt={`Page ${index + 1}`}
									style={{
										maxWidth: '100%',
										maxHeight: '100%',
										objectFit: 'contain',
									}}
								/>
							</div>

							<div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '5px',
									}}
								>
									<button
										type="button"
										onClick={() => moveImage(index, 'left')}
										disabled={index === 0}
										className="mgmt-btn"
										style={{ padding: '5px', justifyContent: 'center' }}
										title="Di chuyển lên trước"
									>
										<FiArrowLeft />
									</button>
									<button
										type="button"
										onClick={() => moveImage(index, 'right')}
										disabled={index === images.length - 1}
										className="mgmt-btn"
										style={{ padding: '5px', justifyContent: 'center' }}
										title="Di chuyển ra sau"
									>
										<FiArrowRight />
									</button>
								</div>

								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '5px',
									}}
								>
									<label
										className="mgmt-btn edit"
										style={{
											padding: '5px',
											justifyContent: 'center',
											fontSize: '12px',
											cursor: 'pointer',
										}}
									>
										<FiRefreshCw /> Thay
										<input
											type="file"
											accept="image/*"
											onChange={(e) => handleReplaceImage(index, e)}
											style={{ display: 'none' }}
										/>
									</label>
									<button
										type="button"
										className="mgmt-btn delete"
										onClick={() => handleDeleteImage(index)}
										style={{
											padding: '5px',
											justifyContent: 'center',
											fontSize: '12px',
										}}
									>
										<FiTrash2 /> Xóa
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default EditChapterForm;
