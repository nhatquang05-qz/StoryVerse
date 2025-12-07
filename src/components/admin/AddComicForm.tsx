import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { type Genre } from '../../types/comicTypes';
import { FiArrowLeft } from 'react-icons/fi';
import GenreSelector from './GenreSelector';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface AddComicFormProps {
	allGenres: Genre[];
	onCancel: () => void;
	onSuccess: () => void;
	initialIsDigital: boolean;
}

const AddComicForm: React.FC<AddComicFormProps> = ({
	allGenres,
	onCancel,
	onSuccess,
	initialIsDigital,
}) => {
	const { showToast } = useToast();

	const [title, setTitle] = useState('');
	const [author, setAuthor] = useState('');
	const [description, setDescription] = useState('');
	const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Dropped'>('Ongoing');
	const [price, setPrice] = useState(0);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [coverImageUrl, setCoverImageUrl] = useState('');
	const [isUploadingCover, setIsUploadingCover] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setCoverImageFile(e.target.files[0]);
			setCoverImageUrl('');
		}
	};

	const handleUploadCover = async () => {
		if (!coverImageFile) return;

		if (!title.trim()) {
			showToast('Vui lòng nhập Tiêu đề truyện trước khi upload ảnh bìa!', 'warning');
			return;
		}

		setIsUploadingCover(true);
		const token = localStorage.getItem('storyverse_token');

		const formData = new FormData();
		formData.append('image', coverImageFile);

		formData.append('uploadType', 'comic_cover');
		formData.append('comicName', title);

		try {
			const response = await fetch(`${API_BASE_URL}/upload`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: formData,
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Upload failed');

			setCoverImageUrl(data.imageUrl);
			showToast('Upload ảnh bìa thành công!', 'success');
		} catch (error: any) {
			console.error('Upload cover error:', error);
			showToast(`Lỗi upload ảnh bìa: ${error.message}`, 'error');
			setCoverImageUrl('');
		} finally {
			setIsUploadingCover(false);
		}
	};

	const handleGenreChange = (genreId: number) => {
		setSelectedGenres((prev) =>
			prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId],
		);
	};

	const handleSubmitComic = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!title || !coverImageUrl) {
			showToast('Vui lòng nhập tiêu đề và upload ảnh bìa.', 'warning');
			return;
		}

		setIsSubmitting(true);
		const token = localStorage.getItem('storyverse_token');

		try {
			const response = await fetch(`${API_BASE_URL}/comics`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title,
					author,
					description,
					coverImageUrl,
					status,
					isDigital: initialIsDigital,
					price: initialIsDigital ? 0 : price,
					genres: selectedGenres,
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Failed to add comic');

			showToast(`Thêm truyện "${title}" thành công!`, 'success');
			onSuccess();
		} catch (error: any) {
			console.error('Submit comic error:', error);
			showToast(`Lỗi thêm truyện: ${error.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="admin-form-container">
			<button className="admin-back-btn" onClick={onCancel}>
				<FiArrowLeft /> Quay Lại
			</button>

			<form onSubmit={handleSubmitComic} className="admin-form">
				<h2>Thêm Truyện Mới ({initialIsDigital ? 'Online' : 'In Ấn'})</h2>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
					<div className="form-group">
						<label>
							Tiêu đề <span style={{ color: 'red' }}>*</span>:
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
							placeholder="Nhập tên truyện..."
						/>
					</div>
					<div className="form-group">
						<label>Tác giả:</label>
						<input
							type="text"
							value={author}
							onChange={(e) => setAuthor(e.target.value)}
							placeholder="Tên tác giả..."
						/>
					</div>
				</div>

				<div className="form-group">
					<label>Mô tả:</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Tóm tắt nội dung..."
					/>
				</div>

				<div className="form-group">
					<label>
						Ảnh bìa <span style={{ color: 'red' }}>*</span>:
					</label>
					<div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
						<input type="file" accept="image/*" onChange={handleCoverImageChange} />
						<button
							type="button"
							onClick={handleUploadCover}
							disabled={!coverImageFile || isUploadingCover || !!coverImageUrl}
							className="mgmt-btn edit"
							style={{ minWidth: '120px' }}
						>
							{isUploadingCover
								? 'Đang tải...'
								: coverImageUrl
									? 'Đã tải lên ✓'
									: 'Upload Ngay'}
						</button>
						{coverImageUrl && (
							<img
								src={coverImageUrl}
								alt="Preview"
								style={{
									height: '40px',
									borderRadius: '4px',
									border: '1px solid #ccc',
								}}
							/>
						)}
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: initialIsDigital ? '1fr' : '1fr 1fr',
						gap: '1rem',
					}}
				>
					<div className="form-group">
						<label>Trạng thái:</label>
						<select value={status} onChange={(e) => setStatus(e.target.value as any)}>
							<option value="Ongoing">Đang tiến hành (Ongoing)</option>
							<option value="Completed">Đã hoàn thành (Completed)</option>
							<option value="Dropped">Tạm ngưng (Dropped)</option>
						</select>
					</div>

					{!initialIsDigital && (
						<div className="form-group">
							<label>Giá bán (VNĐ):</label>
							<input
								type="number"
								value={price}
								onChange={(e) => setPrice(Number(e.target.value))}
								min="0"
							/>
						</div>
					)}
				</div>

				<div className="form-group">
					<label>Thể loại:</label>
					<GenreSelector
						allGenres={allGenres}
						selectedGenres={selectedGenres}
						onChange={handleGenreChange}
					/>
				</div>

				<div className="form-actions">
					<button
						type="submit"
						className="mgmt-btn add"
						disabled={isSubmitting || !coverImageUrl || isUploadingCover}
						style={{ width: '100%', padding: '1rem' }}
					>
						{isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Thêm Truyện'}
					</button>
				</div>
			</form>
		</div>
	);
};

export default AddComicForm;