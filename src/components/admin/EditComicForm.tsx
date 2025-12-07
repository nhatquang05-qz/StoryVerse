import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { type ComicSummary, type ComicDetail, type Genre } from '../../types/comicTypes';
import { FiArrowLeft, FiSave, FiTrash2, FiUpload, FiX, FiDownload } from 'react-icons/fi';
import GenreSelector from './GenreSelector';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface EditComicFormProps {
	comic: ComicSummary;
	allGenres: Genre[];
	onCancel: () => void;
	onSuccess: () => void;
}

const EditComicForm: React.FC<EditComicFormProps> = ({ comic, allGenres, onCancel, onSuccess }) => {
	const { showNotification } = useNotification();

	const [formData, setFormData] = useState<ComicDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
	const [previewCoverUrl, setPreviewCoverUrl] = useState<string>('');

	useEffect(() => {
		const fetchComicDetails = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`);
				if (!response.ok) throw new Error('Không thể tải chi tiết truyện');
				const data: ComicDetail = await response.json();
				setFormData(data);
				setSelectedGenres(data.genres?.map((g) => g.id) || []);
				setPreviewCoverUrl(data.coverImageUrl);
			} catch (error: any) {
				showNotification(`Lỗi tải chi tiết truyện: ${error.message}`, 'error');
				onCancel();
			} finally {
				setIsLoading(false);
			}
		};
		fetchComicDetails();
	}, [comic.id, showNotification, onCancel]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value, type } = e.target;
		if (!formData) return;

		setFormData((prev) => {
			if (!prev) return null;
			return {
				...prev,
				[name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
			};
		});
	};

	const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			setCoverImageFile(file);
			setPreviewCoverUrl(URL.createObjectURL(file));
		}
	};

	const handleDownloadCover = async () => {
		if (!previewCoverUrl) return;
		try {
			const response = await fetch(previewCoverUrl);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `cover-${formData?.title || 'image'}.jpg`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error('Download failed:', error);

			window.open(previewCoverUrl, '_blank');
		}
	};

	const handleGenreChange = (genreId: number) => {
		setSelectedGenres((prev) =>
			prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId],
		);
	};

	const handleUpdateComic = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData) return;

		setIsSubmitting(true);
		const token = localStorage.getItem('storyverse_token');

		try {
			let finalCoverUrl = formData.coverImageUrl;

			if (coverImageFile) {
				const uploadData = new FormData();
				uploadData.append('image', coverImageFile);
				uploadData.append('uploadType', 'comic_cover');
				uploadData.append('comicName', formData.title);

				const uploadRes = await fetch(`${API_BASE_URL}/upload`, {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}` },
					body: uploadData,
				});

				if (!uploadRes.ok) throw new Error('Lỗi khi upload ảnh bìa mới');
				const uploadResult = await uploadRes.json();
				finalCoverUrl = uploadResult.imageUrl;
			}

			const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formData,
					coverImageUrl: finalCoverUrl,
					price: formData.isDigital ? 0 : formData.price,
					genres: selectedGenres,
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Cập nhật thất bại');

			showNotification('Cập nhật truyện thành công!', 'success');
			onSuccess();
		} catch (error: any) {
			console.error('Update error:', error);
			showNotification(error.message, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteComic = async () => {
		if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}"?`)) return;

		setIsDeleting(true);
		const token = localStorage.getItem('storyverse_token');

		try {
			const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${token}` },
			});
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Xóa thất bại');

			showNotification('Xóa truyện thành công!', 'success');
			onSuccess();
		} catch (error: any) {
			showNotification(error.message, 'error');
		} finally {
			setIsDeleting(false);
		}
	};

	if (isLoading || !formData) {
		return (
			<div className="admin-form-container">
				<p style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</p>
			</div>
		);
	}

	return (
		<div className="admin-form-container">
			<button className="admin-back-btn" onClick={onCancel}>
				<FiArrowLeft /> Quay Lại
			</button>

			<form onSubmit={handleUpdateComic} className="admin-form">
				<h2>Sửa Truyện: {formData.title}</h2>

				<div className="form-group">
					<label>Ảnh bìa:</label>
					<div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
						<div
							style={{
								width: '150px',
								height: '200px',
								border: '1px dashed #ccc',
								borderRadius: '8px',
								overflow: 'hidden',
								position: 'relative',
							}}
						>
							{previewCoverUrl ? (
								<img
									src={previewCoverUrl}
									alt="Cover Preview"
									style={{ width: '100%', height: '100%', objectFit: 'cover' }}
								/>
							) : (
								<div
									style={{
										width: '100%',
										height: '100%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										color: '#888',
									}}
								>
									No Image
								</div>
							)}
						</div>

						<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
							<input
								type="file"
								id="edit-cover-upload"
								accept="image/*"
								onChange={handleCoverImageChange}
								style={{ display: 'none' }}
							/>

							<div style={{ display: 'flex', gap: '10px' }}>
								<label
									htmlFor="edit-cover-upload"
									className="mgmt-btn edit"
									style={{
										cursor: 'pointer',
										display: 'inline-flex',
										alignItems: 'center',
										gap: '5px',
									}}
								>
									<FiUpload /> {coverImageFile ? 'Đổi ảnh khác' : 'Chọn ảnh mới'}
								</label>

								{}
								<button
									type="button"
									className="mgmt-btn"
									onClick={handleDownloadCover}
									title="Tải ảnh bìa về máy"
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '5px',
										backgroundColor: '#3498db',
										color: 'white',
										border: 'none',
									}}
								>
									<FiDownload /> Tải về
								</button>
							</div>

							{coverImageFile && (
								<button
									type="button"
									className="mgmt-btn delete"
									onClick={() => {
										setCoverImageFile(null);
										setPreviewCoverUrl(formData.coverImageUrl);
									}}
									style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: '5px',
									}}
								>
									<FiX /> Hủy thay đổi
								</button>
							)}
							<small style={{ color: '#666' }}>
								{coverImageFile
									? `Đã chọn: ${coverImageFile.name}`
									: 'Ảnh hiện tại đang được sử dụng'}
							</small>
						</div>
					</div>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
					<div className="form-group">
						<label>
							Tiêu đề <span style={{ color: 'red' }}>*</span>:
						</label>
						<input
							type="text"
							name="title"
							value={formData.title}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label>Tác giả:</label>
						<input
							type="text"
							name="author"
							value={formData.author || ''}
							onChange={handleChange}
						/>
					</div>
				</div>

				<div className="form-group">
					<label>Mô tả:</label>
					<textarea
						name="description"
						value={formData.description || ''}
						onChange={handleChange}
						rows={4}
					/>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
					<div className="form-group">
						<label>Trạng thái:</label>
						<select name="status" value={formData.status} onChange={handleChange}>
							<option value="Ongoing">Đang tiến hành</option>
							<option value="Completed">Đã hoàn thành</option>
							<option value="Dropped">Tạm ngưng</option>
						</select>
					</div>

					{!formData.isDigital && (
						<div className="form-group">
							<label>Giá bán (VNĐ):</label>
							<input
								type="number"
								name="price"
								value={formData.price}
								onChange={handleChange}
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
						className="mgmt-btn edit"
						disabled={isSubmitting || isDeleting}
					>
						{isSubmitting ? (
							'Đang lưu...'
						) : (
							<>
								<FiSave /> Lưu Thay Đổi
							</>
						)}
					</button>
					<button
						type="button"
						className="mgmt-btn delete"
						onClick={handleDeleteComic}
						disabled={isSubmitting || isDeleting}
					>
						{isDeleting ? (
							'Đang xóa...'
						) : (
							<>
								<FiTrash2 /> Xóa Truyện Này
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditComicForm;
