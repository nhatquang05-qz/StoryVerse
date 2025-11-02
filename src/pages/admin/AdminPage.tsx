import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { type ComicSummary, type ComicDetail, type ChapterSummary, type Genre } from '../../types/comicTypes';
import {
    FiPlus, FiArrowLeft, FiEdit, FiTrash2, FiList, FiLoader, FiSave,
    FiBookOpen, FiArchive, FiUsers, FiSearch
} from 'react-icons/fi';
import './AdminPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type AdminView = 'digital' | 'physical' | 'users' | 'add' | 'edit' | 'chapters';

interface GenreSelectorProps {
    allGenres: Genre[];
    selectedGenres: number[];
    onChange: (genreId: number) => void;
}

const GenreSelector: React.FC<GenreSelectorProps> = ({ allGenres, selectedGenres, onChange }) => {
    return (
        <div className="genre-selector">
            {allGenres.map(genre => (
                <label key={genre.id} className="genre-checkbox-label">
                    <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.id)}
                        onChange={() => onChange(genre.id)}
                    />
                    {genre.name}
                </label>
            ))}
        </div>
    );
};

interface AddComicFormProps {
    allGenres: Genre[];
    onCancel: () => void;
    onSuccess: () => void;
    initialIsDigital: boolean;
}
const AddComicForm: React.FC<AddComicFormProps> = ({ allGenres, onCancel, onSuccess, initialIsDigital }) => {
    const { showNotification } = useNotification();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Dropped'>('Ongoing');
    const [isDigital, setIsDigital] = useState(initialIsDigital);
    const [price, setPrice] = useState(0);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCoverImageFile(e.target.files[0]);
            setCoverImageUrl('');
        }
    };

    const handleUploadCover = async () => {
        if (!coverImageFile) return;
        setIsUploadingCover(true);
        const token = localStorage.getItem('storyverse_token');
        const formData = new FormData();
        formData.append('image', coverImageFile);

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Upload failed');
            setCoverImageUrl(data.imageUrl);
            showNotification('Upload ảnh bìa thành công!', 'success');
        } catch (error: any) {
            console.error("Upload cover error:", error);
            showNotification(`Lỗi upload ảnh bìa: ${error.message}`, 'error');
            setCoverImageUrl('');
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleGenreChange = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const digital = e.target.value === 'digital';
        setIsDigital(digital);
        if (digital) {
            setPrice(0);
        }
    };

    const handleSubmitComic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !coverImageUrl) {
            showNotification('Vui lòng nhập tiêu đề và upload ảnh bìa.', 'warning');
            return;
        }
        setIsSubmitting(true);
        const token = localStorage.getItem('storyverse_token');

        try {
            const response = await fetch(`${API_BASE_URL}/comics`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title, author, description, coverImageUrl, status, isDigital,
                    price: isDigital ? 0 : price,
                    genres: selectedGenres
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add comic');
            showNotification(`Thêm truyện "${title}" thành công! ID: ${data.comicId}`, 'success');
            onSuccess();
        } catch (error: any) {
            console.error("Submit comic error:", error);
            showNotification(`Lỗi thêm truyện: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-form-container">
            <button className="admin-back-btn" onClick={onCancel}><FiArrowLeft /> Quay Lại</button>
            <form onSubmit={handleSubmitComic} className="admin-form">
                <h2>Thêm Truyện Mới</h2>
                <div className="form-group"><label>Tiêu đề:</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Tác giả:</label><input type="text" value={author} onChange={e => setAuthor(e.target.value)} /></div>
                <div className="form-group"><label>Mô tả:</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
                <div className="form-group"><label>Ảnh bìa:</label>
                    <input type="file" accept="image/*" onChange={handleCoverImageChange} style={{ marginLeft: '5px' }} />
                    <button type="button" onClick={handleUploadCover} disabled={!coverImageFile || isUploadingCover || !!coverImageUrl} className="mgmt-btn edit">
                        {isUploadingCover ? 'Đang tải...' : (coverImageUrl ? 'Đã tải lên ✓' : 'Upload ảnh bìa')}
                    </button>
                    {coverImageUrl && <img src={coverImageUrl} alt="Preview" style={{ width: '50px', verticalAlign: 'middle', marginLeft: '10px' }} />}
                </div>
                <div className="form-group"><label>Trạng thái:</label>
                    <select value={status} onChange={e => setStatus(e.target.value as any)}>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Dropped">Dropped</option>
                    </select>
                </div>
                <div className="form-group"><label>Loại:</label>
                    <select value={isDigital ? 'digital' : 'physical'} onChange={handleTypeChange}>
                        <option value="digital">Digital (Đọc Online)</option>
                        <option value="physical">Physical (Truyện In)</option>
                    </select>
                </div>
                {!isDigital && (
                    <div className="form-group">
                        <label>Giá (VND cho Physical):</label>
                        <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                )}
                <div className="form-group"><label>Thể loại:</label>
                    <GenreSelector allGenres={allGenres} selectedGenres={selectedGenres} onChange={handleGenreChange} />
                </div>

                <button type="submit" className="mgmt-btn add" disabled={isSubmitting || !coverImageUrl || isUploadingCover}>
                    {isSubmitting ? 'Đang thêm...' : 'Thêm Truyện'}
                </button>
            </form>
        </div>
    );
};

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

    useEffect(() => {
        const fetchComicDetails = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`);
                if (!response.ok) throw new Error('Không thể tải chi tiết truyện');
                const data: ComicDetail = await response.json();
                setFormData(data);
                setSelectedGenres(data.genres?.map(g => g.id) || []);
            } catch (error: any) {
                showNotification(`Lỗi tải chi tiết truyện: ${error.message}`, 'error');
                onCancel();
            } finally {
                setIsLoading(false);
            }
        };
        fetchComicDetails();
    }, [comic.id, showNotification, onCancel]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (!formData) return;

        setFormData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            };
        });
    };

    const handleIsDigitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!formData) return;
        const digital = e.target.value === 'digital';
        setFormData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                isDigital: digital,
                price: digital ? 0 : prev.price
            };
        });
    };

    const handleGenreChange = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
    };

    const handleUpdateComic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('storyverse_token');

        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    price: formData.isDigital ? 0 : formData.price,
                    genres: selectedGenres
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Cập nhật thất bại');
            showNotification('Cập nhật truyện thành công!', 'success');
            onSuccess();
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComic = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }
        setIsDeleting(true);
        const token = localStorage.getItem('storyverse_token');

        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
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

    if (isLoading) {
        return <div className="admin-form-container"><p>Đang tải chi tiết truyện...</p></div>;
    }

    if (!formData) {
        return <div className="admin-form-container"><p>Không thể tải chi tiết truyện.</p></div>;
    }

    return (
        <div className="admin-form-container">
            <button className="admin-back-btn" onClick={onCancel}><FiArrowLeft /> Quay Lại</button>
            <form onSubmit={handleUpdateComic} className="admin-form">
                <h2>Sửa Truyện: {comic.title}</h2>
                <div className="form-group"><label>Tiêu đề:</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                <div className="form-group"><label>Tác giả:</label><input type="text" name="author" value={formData.author || ''} onChange={handleChange} /></div>

                <div className="form-group"><label>Mô tả:</label><textarea name="description" value={formData.description || ''} onChange={handleChange} /></div>

                <div className="form-group"><label>Ảnh bìa (URL):</label>
                    <input type="text" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} required />
                    {formData.coverImageUrl && <img src={formData.coverImageUrl} alt="Preview" style={{ width: '50px', verticalAlign: 'middle', marginLeft: '10px' }} />}
                </div>

                <div className="form-group"><label>Trạng thái:</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Dropped">Dropped</option>
                    </select>
                </div>
                <div className="form-group"><label>Loại:</label>
                    <select value={formData.isDigital ? 'digital' : 'physical'} onChange={handleIsDigitalChange}>
                        <option value="digital">Digital (Đọc Online)</option>
                        <option value="physical">Physical (Truyện In)</option>
                    </select>
                </div>
                {!formData.isDigital && (
                    <div className="form-group">
                        <label>Giá (VND cho Physical):</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} />
                    </div>
                )}
                <div className="form-group"><label>Thể loại:</label>
                    <GenreSelector allGenres={allGenres} selectedGenres={selectedGenres} onChange={handleGenreChange} />
                </div>

                <div className="form-actions">
                    <button type="submit" className="mgmt-btn edit" disabled={isSubmitting || isDeleting}>
                        {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSave />}
                        Lưu Thay Đổi
                    </button>
                    <button type="button" className="mgmt-btn delete" onClick={handleDeleteComic} disabled={isSubmitting || isDeleting}>
                        {isDeleting ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                        Xóa Truyện Này
                    </button>
                </div>
            </form>
        </div>
    );
};

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
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `Upload ảnh ${i + 1} thất bại`);
                uploadedUrls.push(data.imageUrl);
                setUploadProgress(((i + 1) / totalFiles) * 100);
            }
            setChapterImageUrls(uploadedUrls);
            showNotification(`Upload ${uploadedUrls.length} ảnh chương thành công!`, 'success');

        } catch (error: any) {
            console.error("Upload chapter images error:", error);
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
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    chapterNumber: parseFloat(chapterNumber),
                    title: chapterTitle || null,
                    contentUrls: chapterImageUrls,
                    price: chapterPrice
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add chapter');
            showNotification(`Thêm chương ${chapterNumber} thành công!`, 'success');
            setChapterNumber(''); setChapterTitle('');
            setChapterImageFiles(null); setChapterImageUrls([]); setChapterPrice(0); setUploadProgress(0);
            onSuccess();
        } catch (error: any) {
            console.error("Submit chapter error:", error);
            showNotification(`Lỗi thêm chương: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmitChapter} className="admin-form" style={{ borderBottom: '2px solid var(--clr-primary)', paddingBottom: '2rem' }}>
            <h3>Thêm Chương Mới</h3>
            <div className="form-group"><label>Số Chương (vd: 1, 1.5):</label><input type="number" step="0.1" value={chapterNumber} onChange={e => setChapterNumber(e.target.value)} required /></div>
            <div className="form-group"><label>Tiêu đề chương (tùy chọn):</label><input type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} /></div>
            <div className="form-group"><label>Giá Xu (0 = Miễn phí):</label><input type="number" value={chapterPrice} onChange={e => setChapterPrice(Number(e.target.value) || 0)} /></div>

            <div className="form-group"><label>Ảnh nội dung ({chapterImageUrls.length} ảnh đã upload):</label>
                <input type="file" accept="image/*" multiple onChange={handleChapterImagesChange} style={{ marginLeft: '5px' }} />
                <button type="button" onClick={handleUploadChapterImages} disabled={!chapterImageFiles || chapterImageFiles.length === 0 || isUploadingChapters || chapterImageUrls.length > 0} className="mgmt-btn edit">
                    {isUploadingChapters ? `Đang tải (${uploadProgress.toFixed(0)}%)...` : (chapterImageUrls.length > 0 ? `Đã tải ${chapterImageUrls.length} ảnh ✓` : 'Upload ảnh chương')}
                </button>
                {isUploadingChapters && <progress value={uploadProgress} max="100" style={{ width: '100%' }} />}
            </div>

            <button type="submit" className="mgmt-btn add" disabled={isSubmitting || chapterImageUrls.length === 0 || isUploadingChapters}>
                {isSubmitting ? 'Đang thêm...' : 'Thêm Chương'}
            </button>
        </form>
    );
};

interface ManageChaptersProps {
    comic: ComicSummary;
    onCancel: () => void;
}
const ManageChapters: React.FC<ManageChaptersProps> = ({ comic, onCancel }) => {
    const { showNotification } = useNotification();
    const [comicDetails, setComicDetails] = useState<ComicDetail | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

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

    const handleEditImages = (chapter: ChapterSummary) => {
        showNotification(`Chức năng "Sửa ảnh" cho Chương ${chapter.chapterNumber} đang được phát triển.`, 'info');
    };

    const handleDeleteChapter = async (chapter: ChapterSummary) => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn "Chương ${chapter.chapterNumber}" không?`)) {
            return;
        }

        const token = localStorage.getItem('storyverse_token');
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}/chapters/${chapter.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Xóa chương thất bại');
            showNotification('Xóa chương thành công!', 'success');
            fetchComicDetails();
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    return (
        <div className="admin-form-container">
            <button className="admin-back-btn" onClick={onCancel}><FiArrowLeft /> Quay Lại Danh Sách Truyện</button>
            <h2>Quản Lý Chương: {comic.title}</h2>

            <AddChapterForm comicId={comic.id} onSuccess={fetchComicDetails} />

            <div className="chapter-management-list">
                <h3>Các Chương Hiện Có ({comicDetails?.chapters?.length || 0})</h3>
                {isLoadingDetails && <p>Đang tải danh sách chương...</p>}
                {!isLoadingDetails && comicDetails?.chapters && (
                    <ul>
                        {comicDetails.chapters.sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber)).map(chap => (
                            <li key={chap.id} className="chapter-manage-item">
                                <div className="chapter-manage-info">
                                    <strong>Chương {chap.chapterNumber}</strong>
                                    <span>{chap.title || '(Không có tiêu đề)'}</span>
                                    <span className="price-tag">{chap.price === 0 ? 'Miễn Phí' : `${chap.price} Xu`}</span>
                                </div>
                                <div className="chapter-manage-actions">
                                    <button className="mgmt-btn edit" onClick={() => handleEditImages(chap)}>
                                        <FiEdit /> Sửa Ảnh
                                    </button>
                                    <button className="mgmt-btn delete" onClick={() => handleDeleteChapter(chap)}>
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

interface ManagementProductCardProps {
    comic: ComicSummary;
    onEdit: () => void;
    onDelete: () => void;
    onManageChapters: () => void;
}

const ManagementProductCard: React.FC<ManagementProductCardProps> = ({ comic, onEdit, onDelete, onManageChapters }) => {
    return (
        <div className="mgmt-card">
            <img src={comic.coverImageUrl} alt={comic.title} className="mgmt-card-image" />
            <div className="mgmt-card-info">
                <h4 className="mgmt-card-title">{comic.title}</h4>
                <span className="mgmt-card-id">ID: {comic.id}</span>
                <span className={`mgmt-card-status ${comic.status}`}>{comic.status}</span>
                <span className={`mgmt-card-type ${comic.isDigital ? 'digital' : 'physical'}`}>
                    {comic.isDigital ? 'Digital' : 'Physical'}
                </span>
            </div>
            <div className="mgmt-card-actions">
                <button className="mgmt-btn edit" onClick={onEdit}><FiEdit /> Sửa</button>
                <button className="mgmt-btn delete" onClick={onDelete}><FiTrash2 /> Xóa</button>
                {comic.isDigital && (
                    <button className="mgmt-btn chapters" onClick={onManageChapters}><FiList /> Chương</button>
                )}
            </div>
        </div>
    );
};

interface AdminSidebarProps {
    activeView: AdminView;
    onNavigate: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onNavigate }) => {
    return (
        <nav className="admin-sidebar">
            <h3>STORYVERSE</h3>
            <h4>Bảng Điều Khiển</h4>
            <button
                className={`sidebar-btn ${activeView === 'digital' ? 'active' : ''}`}
                onClick={() => onNavigate('digital')}
            >
                <FiBookOpen /> Quản lý Truyện Online
            </button>
            <button
                className={`sidebar-btn ${activeView === 'physical' ? 'active' : ''}`}
                onClick={() => onNavigate('physical')}
            >
                <FiArchive /> Quản lý Truyện In
            </button>
            <button
                className={`sidebar-btn ${activeView === 'users' ? 'active' : ''}`}
                onClick={() => onNavigate('users')}
            >
                <FiUsers /> Quản lý Người Dùng
            </button>
        </nav>
    );
};

interface ComicManagementListProps {
    comics: ComicSummary[];
    onEdit: (comic: ComicSummary) => void;
    onDelete: (comic: ComicSummary) => void;
    onManageChapters: (comic: ComicSummary) => void;
}

const ComicManagementList: React.FC<ComicManagementListProps> = ({ comics, onEdit, onDelete, onManageChapters }) => {
    return (
        <div className="admin-comic-list">
            {comics.length === 0 && <p>Không tìm thấy truyện nào phù hợp.</p>}
            {comics.map(comic => (
                <ManagementProductCard
                    key={comic.id}
                    comic={comic}
                    onEdit={() => onEdit(comic)}
                    onDelete={() => onDelete(comic)}
                    onManageChapters={() => onManageChapters(comic)}
                />
            ))}
        </div>
    );
};

type SortOrder = 'newest' | 'oldest' | 'title-az' | 'title-za';

interface AdminFilterBarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
}

const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
    searchTerm, onSearchChange, statusFilter, onStatusChange, sortOrder, onSortChange
}) => {
    return (
        <div className="admin-filter-bar">
            <div className="filter-group search-bar">
                <FiSearch />
                <input
                    type="text"
                    placeholder="Tìm theo tên truyện..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="filter-group">
                <label>Trạng thái:</label>
                <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
                    <option value="all">Tất cả</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                </select>
            </div>
            <div className="filter-group">
                <label>Sắp xếp:</label>
                <select value={sortOrder} onChange={(e) => onSortChange(e.target.value as SortOrder)}>
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="title-az">Tên A-Z</option>
                    <option value="title-za">Tên Z-A</option>
                </select>
            </div>
        </div>
    );
};

const UserManagementPlaceholder = () => (
    <div className="admin-form-container">
        <h2>Quản Lý Người Dùng</h2>
        <p>Chức năng này đang được phát triển và sẽ sớm ra mắt.</p>
    </div>
);

const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const [activeView, setActiveView] = useState<AdminView>('digital');
    const [comics, setComics] = useState<ComicSummary[]>([]);
    const [allGenres, setAllGenres] = useState<Genre[]>([]);
    const [selectedComic, setSelectedComic] = useState<ComicSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [addFormType, setAddFormType] = useState<'digital' | 'physical'>('digital');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    const isAdmin = currentUser?.email === 'admin@123';

    const fetchComicsAndGenres = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [comicsResponse, genresResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/comics`),
                fetch(`${API_BASE_URL}/comics/system/genres`)
            ]);

            if (!comicsResponse.ok) throw new Error('Không thể tải danh sách truyện');
            const comicsData: ComicSummary[] = await comicsResponse.json();
            setComics(comicsData);

            if (!genresResponse.ok) throw new Error('Không thể tải danh sách thể loại');
            const genresData: Genre[] = await genresResponse.json();
            setAllGenres(genresData);

        } catch (err: any) {
            setError(err.message);
            showNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchComicsAndGenres();
        }
    }, [isAdmin]);
    
    const filteredComics = useMemo(() => {
        let comicsToFilter = [...comics];

        if (searchTerm) {
            comicsToFilter = comicsToFilter.filter(comic =>
                comic.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            comicsToFilter = comicsToFilter.filter(comic => comic.status === statusFilter);
        }
        
        switch (sortOrder) {
            case 'newest':
                comicsToFilter.sort((a, b) => b.id - a.id);
                break;
            case 'oldest':
                comicsToFilter.sort((a, b) => a.id - b.id);
                break;
            case 'title-az':
                comicsToFilter.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'title-za':
                comicsToFilter.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }

        return comicsToFilter;
    }, [comics, searchTerm, statusFilter, sortOrder]);


    const handleSelectEdit = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setActiveView('edit');
    };

    const handleSelectChapters = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setActiveView('chapters');
    };

    const handleDeleteComic = async (comic: ComicSummary) => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }

        const token = localStorage.getItem('storyverse_token');
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Xóa thất bại');
            showNotification('Xóa truyện thành công!', 'success');
            fetchComicsAndGenres();
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
    };

    const handleFormSuccess = () => {
        fetchComicsAndGenres();
        const defaultView = (selectedComic && !selectedComic.isDigital) ? 'physical' : 'digital';
        setActiveView(defaultView);
        setSelectedComic(null);
    };

    const handleFormCancel = () => {
        const defaultView = (selectedComic && !selectedComic.isDigital) ? 'physical' : 'digital';
        setActiveView(defaultView);
        setSelectedComic(null);
    };

    const handleShowAddForm = (type: 'digital' | 'physical') => {
        setAddFormType(type);
        setActiveView('add');
    };

    const handleAddSuccess = () => {
        fetchComicsAndGenres();
        setActiveView(addFormType);
        setSelectedComic(null);
    };

    const handleAddCancel = () => {
        setActiveView(addFormType);
        setSelectedComic(null);
    };


    const renderContent = () => {
        if (isLoading) return <p>Đang tải dữ liệu quản trị...</p>;
        if (error) return <p style={{ color: 'var(--clr-error-text)' }}>{error}</p>;

        const digitalComics = filteredComics.filter(c => c.isDigital);
        const physicalComics = filteredComics.filter(c => !c.isDigital);
        
        const filterBar = (
            <AdminFilterBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
            />
        );

        switch (activeView) {
            case 'add':
                return <AddComicForm
                    allGenres={allGenres}
                    onCancel={handleAddCancel}
                    onSuccess={handleAddSuccess}
                    initialIsDigital={addFormType === 'digital'}
                />;
            case 'edit':
                if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <EditComicForm
                    comic={selectedComic}
                    allGenres={allGenres}
                    onCancel={handleFormCancel}
                    onSuccess={handleFormSuccess}
                />;
            case 'chapters':
                if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <ManageChapters comic={selectedComic} onCancel={handleFormCancel} />;
            case 'users':
                return <UserManagementPlaceholder />;
            case 'physical':
                return (
                    <>
                        <div className="admin-header">
                            <h2>Quản Lý Truyện In ({physicalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('physical')}>
                                <FiPlus /> Thêm Truyện In
                            </button>
                        </div>
                        {filterBar}
                        <ComicManagementList comics={physicalComics} onEdit={handleSelectEdit} onDelete={handleDeleteComic} onManageChapters={handleSelectChapters} />
                    </>
                );
            case 'digital':
            default:
                return (
                    <>
                        <div className="admin-header">
                            <h2>Quản Lý Truyện Online ({digitalComics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => handleShowAddForm('digital')}>
                                <FiPlus /> Thêm Truyện Online
                            </button>
                        </div>
                        {filterBar}
                        <ComicManagementList comics={digitalComics} onEdit={handleSelectEdit} onDelete={handleDeleteComic} onManageChapters={handleSelectChapters} />
                    </>
                );
        }
    };

    if (!currentUser) {
        return <div style={{ padding: '2rem' }}>Vui lòng đăng nhập với tài khoản Admin.</div>;
    }
    if (!isAdmin) {
        return <div style={{ padding: '2rem' }}>Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="admin-content">
                <h1>Trang Quản Trị StoryVerse</h1>
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminPage;