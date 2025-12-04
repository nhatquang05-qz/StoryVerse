import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface AddChapterFormProps {
	comicId: number;
	onSuccess: () => void;
}

const AddChapterForm: React.FC<AddChapterFormProps> = ({ comicId, onSuccess }) => {
	const { showNotification } = useNotification();
	const [chapterNumber, setChapterNumber] = useState('');
	const [chapterTitle, setChapterTitle] = useState('');
	const [chapterImageFiles, setChapterImageFiles] = useState<FileList | null>(null);
	const [chapterImageUrls, setChapterImageUrls] = useState<string[]>([]);
	const [isUploadingChapters, setIsUploadingChapters] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [chapterPrice, setChapterPrice] = useState(0);

	const handleChapterImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setChapterImageFiles(e.target.files);
		setChapterImageUrls([]);
		setUploadProgress(0);
	};

	const handleUploadChapterImages = async () => {
		if (!chapterImageFiles || chapterImageFiles.length === 0) return;
		setIsUploadingChapters(true);
		setUploadProgress(0);
		const token = localStorage.getItem('storyverse_token');
		const uploadedUrls: string[] = [];
		const totalFiles = chapterImageFiles.length;

		try {
			for (let i = 0; i < totalFiles; i++) {
				const file = chapterImageFiles[i];
				const formData = new FormData();
				formData.append('image', file);

				const response = await fetch(`${API_BASE_URL}/upload`, {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					body: formData,
				});
				const data = await response.json();
				if (!response.ok) throw new Error(data.error || `Upload ảnh ${i + 1} thất bại`);
				uploadedUrls.push(data.imageUrl);
				setUploadProgress(((i + 1) / totalFiles) * 100);
			}
			setChapterImageUrls(uploadedUrls);
			showNotification(`Upload ${uploadedUrls.length} ảnh chương thành công!`, 'success');
		} catch (error: any) {
			console.error('Upload chapter images error:', error);
			showNotification(`Lỗi upload ảnh chương: ${error.message}`, 'error');
			setChapterImageUrls([]);
			setUploadProgress(0);
		} finally {
			setIsUploadingChapters(false);
		}
	};

	const handleSubmitChapter = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!comicId || !chapterNumber || chapterImageUrls.length === 0) {
			showNotification('Vui lòng nhập ID truyện, số chương và upload ảnh.', 'warning');
			return;
		}
		setIsSubmitting(true);
		const token = localStorage.getItem('storyverse_token');

		try {
			const response = await fetch(`${API_BASE_URL}/comics/${comicId}/chapters`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					chapterNumber: parseFloat(chapterNumber),
					title: chapterTitle || null,
					contentUrls: chapterImageUrls,
					price: chapterPrice,
				}),
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Failed to add chapter');
			showNotification(`Thêm chương ${chapterNumber} thành công!`, 'success');
			setChapterNumber('');
			setChapterTitle('');
			setChapterImageFiles(null);
			setChapterImageUrls([]);
			setChapterPrice(0);
			setUploadProgress(0);
			onSuccess();
		} catch (error: any) {
			console.error('Submit chapter error:', error);
			showNotification(`Lỗi thêm chương: ${error.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmitChapter}
			className="admin-form"
			style={{ borderBottom: '2px solid var(--clr-primary)', paddingBottom: '2rem' }}
		>
			<h3>Thêm Chương Mới</h3>
			<div className="form-group">
				<label>Số Chương (vd: 1, 1.5):</label>
				<input
					type="number"
					step="0.1"
					value={chapterNumber}
					onChange={(e) => setChapterNumber(e.target.value)}
					required
				/>
			</div>
			<div className="form-group">
				<label>Tiêu đề chương (tùy chọn):</label>
				<input
					type="text"
					value={chapterTitle}
					onChange={(e) => setChapterTitle(e.target.value)}
				/>
			</div>
			<div className="form-group">
				<label>Giá Xu (0 = Miễn phí):</label>
				<input
					type="number"
					value={chapterPrice}
					onChange={(e) => setChapterPrice(Number(e.target.value) || 0)}
				/>
			</div>

			<div className="form-group">
				<label>Ảnh nội dung ({chapterImageUrls.length} ảnh đã upload):</label>
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={handleChapterImagesChange}
					style={{ marginLeft: '5px' }}
				/>
				<button
					type="button"
					onClick={handleUploadChapterImages}
					disabled={
						!chapterImageFiles ||
						chapterImageFiles.length === 0 ||
						isUploadingChapters ||
						chapterImageUrls.length > 0
					}
					className="mgmt-btn edit"
				>
					{isUploadingChapters
						? `Đang tải (${uploadProgress.toFixed(0)}%)...`
						: chapterImageUrls.length > 0
							? `Đã tải ${chapterImageUrls.length} ảnh ✓`
							: 'Upload ảnh chương'}
				</button>
				{isUploadingChapters && (
					<progress value={uploadProgress} max="100" style={{ width: '100%' }} />
				)}
			</div>

			<button
				type="submit"
				className="mgmt-btn add"
				disabled={isSubmitting || chapterImageUrls.length === 0 || isUploadingChapters}
			>
				{isSubmitting ? 'Đang thêm...' : 'Thêm Chương'}
			</button>
		</form>
	);
};

export default AddChapterForm;
