import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { type ComicSummary, type ComicDetail, type ChapterSummary } from '../../types/comicTypes';
import { FiPlus, FiArrowLeft, FiEdit, FiTrash2, FiList, FiUpload, FiLoader, FiSave, FiX } from 'react-icons/fi';
import './AdminPage.css'; // Tệp CSS mới sẽ được tạo ở dưới

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ===================================================================
// ==================== KHUNG NHẬP TRUYỆN MỚI =======================
// ===================================================================
interface AddComicFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}
const AddComicForm: React.FC<AddComicFormProps> = ({ onCancel, onSuccess }) => {
    const { showNotification } = useNotification();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'Ongoing' | 'Completed' | 'Dropped'>('Ongoing');
    const [isDigital, setIsDigital] = useState(true);
    const [price, setPrice] = useState(0);

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
                    title, author, description, coverImageUrl, status, isDigital, price
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add comic');
            showNotification(`Thêm truyện "${title}" thành công! ID: ${data.comicId}`, 'success');
            onSuccess(); // Gọi hàm onSuccess để quay lại danh sách
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
                {/* ... (Các trường input giống hệt form cũ của bạn) ... */}
                <div className="form-group"><label>Tiêu đề:</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></div>
                <div className="form-group"><label>Tác giả:</label><input type="text" value={author} onChange={e => setAuthor(e.target.value)} /></div>
                <div className="form-group"><label>Mô tả:</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
                <div className="form-group"><label>Ảnh bìa:</label>
                    <input type="file" accept="image/*" onChange={handleCoverImageChange} style={{ marginLeft: '5px' }}/>
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
                    <select value={isDigital ? 'digital' : 'physical'} onChange={e => setIsDigital(e.target.value === 'digital')}>
                        <option value="digital">Digital (Đọc Online)</option>
                        <option value="physical">Physical (Truyện In)</option>
                    </select>
                </div>
                <div className="form-group"><label>Giá (VND cho Physical, Xu cho Digital Chapter):</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
                
                <button type="submit" className="mgmt-btn add" disabled={isSubmitting || !coverImageUrl || isUploadingCover}>
                    {isSubmitting ? 'Đang thêm...' : 'Thêm Truyện'}
                </button>
            </form>
        </div>
    );
};

// ===================================================================
// ==================== KHUNG SỬA TRUYỆN ============================
// ===================================================================
interface EditComicFormProps {
    comic: ComicSummary;
    onCancel: () => void;
    onSuccess: () => void;
}
const EditComicForm: React.FC<EditComicFormProps> = ({ comic, onCancel, onSuccess }) => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState(comic);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // TODO: Thêm logic upload ảnh bìa mới nếu cần

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };
    
    const handleIsDigitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
         setFormData(prev => ({
            ...prev,
            isDigital: e.target.value === 'digital',
        }));
    };

    const handleUpdateComic = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('storyverse_token');
        
        // !!! LƯU Ý: Backend của bạn chưa có API để SỬA truyện.
        // Bạn cần tạo một endpoint `PUT /api/comics/:id` trong `comicRoutes.js`
        // Tạm thời, tôi sẽ giả lập và thông báo.
        
        console.log("Dữ liệu gửi đi (Update):", formData);
        showNotification("LƯU Ý: Chức năng `Sửa` chưa được kết nối API (PUT /api/comics/:id).", "info");
        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess(); // Quay lại và giả lập thành công
        }, 1000);
        
        /* // --- Code thật khi có API ---
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, { 
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Cập nhật thất bại');
            showNotification('Cập nhật truyện thành công!', 'success');
            onSuccess();
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsSubmitting(false);
        }
        */
    };

    const handleDeleteComic = async () => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }
        setIsDeleting(true);
        const token = localStorage.getItem('storyverse_token');

        // !!! LƯU Ý: Backend của bạn chưa có API để XÓA truyện.
        // Bạn cần tạo một endpoint `DELETE /api/comics/:id` trong `comicRoutes.js`
        // Tạm thời, tôi sẽ giả lập và thông báo.
        
        console.log("Dữ liệu gửi đi (Delete):", comic.id);
        showNotification("LƯU Ý: Chức năng `Xóa` chưa được kết nối API (DELETE /api/comics/:id).", "info");
        setTimeout(() => {
            setIsDeleting(false);
            onSuccess(); // Quay lại và giả lập thành công
        }, 1000);

        /*
        // --- Code thật khi có API ---
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Xóa thất bại');
            showNotification('Xóa truyện thành công!', 'success');
            onSuccess();
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsDeleting(false);
        }
        */
    };


    return (
        <div className="admin-form-container">
            <button className="admin-back-btn" onClick={onCancel}><FiArrowLeft /> Quay Lại</button>
            <form onSubmit={handleUpdateComic} className="admin-form">
                <h2>Sửa Truyện: {comic.title}</h2>
                <div className="form-group"><label>Tiêu đề:</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                <div className="form-group"><label>Tác giả:</label><input type="text" name="author" value={formData.author} onChange={handleChange} /></div>
                <div className="form-group"><label>Mô tả:</label><textarea name="description" value={formData.description} onChange={handleChange} /></div>
                
                <div className="form-group"><label>Ảnh bìa (URL):</label>
                    <input type="text" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} required />
                    {formData.coverImageUrl && <img src={formData.coverImageUrl} alt="Preview" style={{ width: '50px', verticalAlign: 'middle', marginLeft: '10px' }} />}
                    {/* TODO: Thêm logic upload ảnh mới tại đây nếu muốn */}
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
                <div className="form-group"><label>Giá (VND cho Physical, Xu cho Digital Chapter):</label><input type="number" name="price" value={formData.price} onChange={handleChange} /></div>
                
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

// ===================================================================
// ==================== KHUNG NHẬP CHƯƠNG MỚI =======================
// ===================================================================
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
            // Reset form
            setChapterNumber(''); setChapterTitle('');
            setChapterImageFiles(null); setChapterImageUrls([]); setChapterPrice(0); setUploadProgress(0);
            onSuccess(); // Tải lại danh sách chương
        } catch (error: any) {
            console.error("Submit chapter error:", error);
            showNotification(`Lỗi thêm chương: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
         <form onSubmit={handleSubmitChapter} className="admin-form" style={{borderBottom: '2px solid var(--clr-primary)', paddingBottom: '2rem'}}>
            <h3>Thêm Chương Mới</h3>
            <div className="form-group"><label>Số Chương (vd: 1, 1.5):</label><input type="number" step="0.1" value={chapterNumber} onChange={e => setChapterNumber(e.target.value)} required /></div>
            <div className="form-group"><label>Tiêu đề chương (tùy chọn):</label><input type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} /></div>
            <div className="form-group"><label>Giá Xu (0 = Miễn phí):</label><input type="number" value={chapterPrice} onChange={e => setChapterPrice(Number(e.target.value) || 0)} /></div>
            
            <div className="form-group"><label>Ảnh nội dung ({chapterImageUrls.length} ảnh đã upload):</label>
                <input type="file" accept="image/*" multiple onChange={handleChapterImagesChange} style={{ marginLeft: '5px' }}/>
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

// ===================================================================
// ==================== KHUNG QUẢN LÝ CHƯƠNG ========================
// ===================================================================
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
        // Đây là chức năng phức tạp, cần một modal/trang mới
        // Tạm thời, chúng ta sẽ thông báo
        showNotification(`Chức năng "Sửa ảnh" cho Chương ${chapter.chapterNumber} đang được phát triển.`, 'info');
    };

    const handleDeleteChapter = async (chapter: ChapterSummary) => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn "Chương ${chapter.chapterNumber}" không?`)) {
            return;
        }

        // !!! LƯU Ý: Backend của bạn chưa có API để XÓA chương.
        // Bạn cần tạo một endpoint `DELETE /api/comics/:comicId/chapters/:chapterId`
        // Tạm thời, tôi sẽ giả lập và thông báo.
        showNotification("LƯU Ý: Chức năng `Xóa Chương` chưa được kết nối API.", "info");
        fetchComicDetails(); // Tải lại danh sách
    };

    return (
        <div className="admin-form-container">
            <button className="admin-back-btn" onClick={onCancel}><FiArrowLeft /> Quay Lại Danh Sách Truyện</button>
            <h2>Quản Lý Chương: {comic.title}</h2>
            
            {/* Form Thêm Chương Mới */}
            <AddChapterForm comicId={comic.id} onSuccess={fetchComicDetails} />

            {/* Danh Sách Chương Hiện Có */}
            <div className="chapter-management-list">
                <h3>Các Chương Hiện Có ({comicDetails?.chapters?.length || 0})</h3>
                {isLoadingDetails && <p>Đang tải danh sách chương...</p>}
                {!isLoadingDetails && comicDetails?.chapters && (
                    <ul>
                        {comicDetails.chapters.sort((a,b) => Number(a.chapterNumber) - Number(b.chapterNumber)).map(chap => (
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


// ===================================================================
// ==================== CARD TRUYỆN (Admin) =========================
// ===================================================================
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


// ===================================================================
// ==================== COMPONENT TRANG ADMIN CHÍNH =================
// ===================================================================
const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [view, setView] = useState<'list' | 'add' | 'edit' | 'chapters'>('list');
    const [comics, setComics] = useState<ComicSummary[]>([]);
    const [selectedComic, setSelectedComic] = useState<ComicSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAdmin = currentUser?.email === 'admin@123'; // Logic check admin của bạn

    const fetchComics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/comics`);
            if (!response.ok) throw new Error('Không thể tải danh sách truyện');
            const data: ComicSummary[] = await response.json();
            setComics(data.sort((a, b) => b.id - a.id)); // Sắp xếp ID mới nhất lên đầu
        } catch (err: any) {
            setError(err.message);
            showNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchComics();
        }
    }, [isAdmin]);

    const handleSelectEdit = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setView('edit');
    };

    const handleSelectChapters = (comic: ComicSummary) => {
        setSelectedComic(comic);
        setView('chapters');
    };

    const handleDeleteComic = async (comic: ComicSummary) => {
        if (!window.confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn truyện "${comic.title}" không? Hành động này không thể hoàn tác.`)) {
            return;
        }
        
        const token = localStorage.getItem('storyverse_token');
        showNotification("LƯU Ý: Chức năng `Xóa` chưa được kết nối API (DELETE /api/comics/:id).", "info");
        fetchComics(); // Tải lại danh sách (giả lập xóa thành công)

        /*
        // --- Code thật khi có API ---
        try {
            const response = await fetch(`${API_BASE_URL}/comics/${comic.id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Xóa thất bại');
            showNotification('Xóa truyện thành công!', 'success');
            fetchComics(); // Tải lại danh sách
        } catch (error: any) {
            showNotification(error.message, 'error');
        }
        */
    };

    const renderContent = () => {
        switch (view) {
            case 'add':
                return <AddComicForm 
                            onCancel={() => setView('list')} 
                            onSuccess={() => { setView('list'); fetchComics(); }} 
                        />;
            case 'edit':
                if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <EditComicForm 
                            comic={selectedComic} 
                            onCancel={() => setView('list')} 
                            onSuccess={() => { setView('list'); fetchComics(); }} 
                        />;
            case 'chapters':
                 if (!selectedComic) return <p>Lỗi: Không có truyện nào được chọn.</p>;
                return <ManageChapters 
                            comic={selectedComic} 
                            onCancel={() => setView('list')} 
                        />;
            case 'list':
            default:
                return (
                    <>
                        <div className="admin-header">
                            <h2>Danh Sách Truyện ({comics.length})</h2>
                            <button className="mgmt-btn add" onClick={() => setView('add')}>
                                <FiPlus /> Thêm Truyện Mới
                            </button>
                        </div>
                        {isLoading && <p>Đang tải danh sách truyện...</p>}
                        {error && <p style={{color: 'var(--clr-error-text)'}}>{error}</p>}
                        {!isLoading && !error && (
                            <div className="admin-comic-list">
                                {comics.map(comic => (
                                    <ManagementProductCard
                                        key={comic.id}
                                        comic={comic}
                                        onEdit={() => handleSelectEdit(comic)}
                                        onDelete={() => handleDeleteComic(comic)}
                                        onManageChapters={() => handleSelectChapters(comic)}
                                    />
                                ))}
                            </div>
                        )}
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
        <div className="admin-page">
            <h1>Trang Quản Trị StoryVerse</h1>
            {renderContent()}
        </div>
    );
};

export default AdminPage;