import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { type ComicSummary, type ComicDetail, type ChapterSummary } from '../../types/comicTypes';
import { FiArrowLeft, FiEdit, FiTrash2, FiLoader } from 'react-icons/fi';
import AddChapterForm from './AddChapterForm';
import EditChapterForm from './EditChapterForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ManageChaptersProps {
	comic: ComicSummary;
	onCancel: () => void;
}

const ManageChapters: React.FC<ManageChaptersProps> = ({ comic, onCancel }) => {
	const { showNotification } = useNotification();
	const [comicDetails, setComicDetails] = useState<ComicDetail | null>(null);
	const [isLoadingDetails, setIsLoadingDetails] = useState(true);

	const [editingChapter, setEditingChapter] = useState<ChapterSummary | null>(null);
	const [editingContentUrls, setEditingContentUrls] = useState<string[]>([]);
	const [isLoadingChapter, setIsLoadingChapter] = useState(false);

	const fetchComicDetails = async () => {
		setIsLoadingDetails(true);
		try {
			const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`);
			if (!response.ok) throw new Error('Không thể tải chi tiết truyện');
			const data: ComicDetail = await response.json();
			setComicDetails(data);
		} catch (error: any) {
			showNotification(error.message, 'error');
		} finally {
			setIsLoadingDetails(false);
		}
	};

	useEffect(() => {
		fetchComicDetails();
	}, [comic.id]);

	const handleEditImages = async (chapter: ChapterSummary) => {
		setIsLoadingChapter(true);
		const token = localStorage.getItem('storyverse_token');
		try {
			const response = await fetch(
				`${API_BASE_URL}/comics/${comic.id}/chapters/${chapter.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.ok) throw new Error('Không thể tải nội dung chương');

			const data = await response.json();

			if (data.contentUrls && Array.isArray(data.contentUrls)) {
				setEditingContentUrls(data.contentUrls);
				setEditingChapter(chapter);
			} else {
				setEditingContentUrls([]);
				setEditingChapter(chapter);
			}
		} catch (error: any) {
			console.error(error);
			showNotification(`Lỗi khi tải ảnh: ${error.message}`, 'error');
		} finally {
			setIsLoadingChapter(false);
		}
	};

	const handleDeleteChapter = async (chapter: ChapterSummary) => {
		if (
			!window.confirm(
				`Bạn có chắc chắn muốn XÓA vĩnh viễn "Chương ${chapter.chapterNumber}" không?`,
			)
		) {
			return;
		}

		const token = localStorage.getItem('storyverse_token');
		try {
			const response = await fetch(
				`${API_BASE_URL}/comics/${comic.id}/chapters/${chapter.id}`,
				{
					method: 'DELETE',
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const data = await response.json();
			if (!response.ok) throw new Error(data.error || 'Xóa chương thất bại');
			showNotification('Xóa chương thành công!', 'success');
			fetchComicDetails();
		} catch (error: any) {
			showNotification(error.message, 'error');
		}
	};

	if (editingChapter) {
		return (
			<EditChapterForm
				comicId={comic.id}
				comicTitle={comic.title}
				chapterId={editingChapter.id}
				chapterNumber={editingChapter.chapterNumber}
				initialContentUrls={editingContentUrls}
				onCancel={() => {
					setEditingChapter(null);
					setEditingContentUrls([]);
				}}
				onSuccess={() => {
					setEditingChapter(null);
					setEditingContentUrls([]);
					fetchComicDetails();
				}}
			/>
		);
	}

	return (
		<div className="admin-form-container">
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<button className="admin-back-btn" onClick={onCancel}>
					<FiArrowLeft /> Quay Lại Danh Sách Truyện
				</button>
				{isLoadingChapter && (
					<span style={{ color: '#666' }}>
						<FiLoader className="animate-spin" /> Đang tải dữ liệu chương...
					</span>
				)}
			</div>

			<h2>Quản Lý Chương: {comic.title}</h2>

			<AddChapterForm
				comicId={comic.id}
				comicTitle={comic.title}
				onSuccess={fetchComicDetails}
			/>

			<div className="chapter-management-list">
				<h3>Các Chương Hiện Có ({comicDetails?.chapters?.length || 0})</h3>
				{isLoadingDetails && <p>Đang tải danh sách chương...</p>}
				{!isLoadingDetails && comicDetails?.chapters && (
					<ul>
						{comicDetails.chapters
							.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))
							.map((chap) => (
								<li key={chap.id} className="chapter-manage-item">
									<div className="chapter-manage-info">
										<strong>Chương {chap.chapterNumber}</strong>
										<span>{chap.title || '(Không có tiêu đề)'}</span>
										<span className="price-tag">
											{chap.price === 0 ? 'Miễn Phí' : `${chap.price} Xu`}
										</span>
									</div>
									<div className="chapter-manage-actions">
										<button
											className="mgmt-btn edit"
											onClick={() => handleEditImages(chap)}
											disabled={isLoadingChapter}
										>
											<FiEdit /> Quản lý Ảnh
										</button>
										<button
											className="mgmt-btn delete"
											onClick={() => handleDeleteChapter(chap)}
											disabled={isLoadingChapter}
										>
											<FiTrash2 /> Xóa
										</button>
									</div>
								</li>
							))}
					</ul>
				)}
			</div>
		</div>
	);
};

export default ManageChapters;
