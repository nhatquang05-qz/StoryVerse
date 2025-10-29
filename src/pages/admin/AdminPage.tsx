// src/pages/admin/AdminPage.tsx
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- AddComicForm ---
const AddComicForm = () => {
    const { showNotification } = useNotification();
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');
    const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Thêm state cho status, isDigital, price, genreIds...
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
            const response = await fetch(`${API_BASE_URL}/upload`, { // Gọi API upload backend
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
            const response = await fetch(`${API_BASE_URL}/comics`, { // Gọi API thêm truyện
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title, author, description, coverImageUrl, status, isDigital, price
                    // genreIds: [] // Thêm logic chọn genre
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to add comic');
            showNotification(`Thêm truyện "${title}" thành công! ID: ${data.comicId}`, 'success');
            // Reset form
            setTitle(''); setAuthor(''); setDescription(''); setCoverImageFile(null);
            setCoverImageUrl(''); setStatus('Ongoing'); setIsDigital(true); setPrice(0);
        } catch (error: any) {
            console.error("Submit comic error:", error);
            showNotification(`Lỗi thêm truyện: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmitComic} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3>Thêm Truyện Mới</h3>
            <label>Tiêu đề: <input type="text" value={title} onChange={e => setTitle(e.target.value)} required /></label>
            <label>Tác giả: <input type="text" value={author} onChange={e => setAuthor(e.target.value)} /></label>
            <label>Mô tả: <textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
            <label>Ảnh bìa:
                <input type="file" accept="image/*" onChange={handleCoverImageChange} style={{ marginLeft: '5px' }}/>
                <button type="button" onClick={handleUploadCover} disabled={!coverImageFile || isUploadingCover || !!coverImageUrl} style={{ marginLeft: '10px' }}>
                    {isUploadingCover ? 'Đang tải...' : (coverImageUrl ? 'Đã tải lên ✓' : 'Upload ảnh bìa')}
                </button>
                {coverImageUrl && <img src={coverImageUrl} alt="Preview" style={{ width: '50px', verticalAlign: 'middle', marginLeft: '10px' }} />}
            </label>
            <label>Trạng thái:
                <select value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                </select>
            </label>
             <label>Loại:
                <select value={isDigital ? 'digital' : 'physical'} onChange={e => setIsDigital(e.target.value === 'digital')}>
                    <option value="digital">Digital (Đọc Online)</option>
                    <option value="physical">Physical (Truyện In)</option>
                </select>
            </label>
            <label>Giá (VND cho Physical, Xu cho Digital Chapter): <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} /></label>
            {/* Thêm chọn Genres */}
            <button type="submit" disabled={isSubmitting || !coverImageUrl || isUploadingCover}>
                {isSubmitting ? 'Đang thêm...' : 'Thêm Truyện'}
            </button>
        </form>
    );
};

// --- AddChapterForm ---
const AddChapterForm = () => {
     const { showNotification } = useNotification();
     const [comicId, setComicId] = useState('');
     const [chapterNumber, setChapterNumber] = useState('');
     const [chapterTitle, setChapterTitle] = useState('');
     const [chapterImageFiles, setChapterImageFiles] = useState<FileList | null>(null);
     const [chapterImageUrls, setChapterImageUrls] = useState<string[]>([]);
     const [isUploadingChapters, setIsUploadingChapters] = useState(false);
     const [uploadProgress, setUploadProgress] = useState(0); // Theo dõi tiến trình
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [chapterPrice, setChapterPrice] = useState(0); // Giá Xu

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

                const response = await fetch(`${API_BASE_URL}/upload`, { // Gọi API upload backend
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `Upload ảnh ${i + 1} thất bại`);
                uploadedUrls.push(data.imageUrl);
                setUploadProgress(((i + 1) / totalFiles) * 100); // Cập nhật tiến trình
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
            const response = await fetch(`${API_BASE_URL}/comics/${comicId}/chapters`, { // Gọi API thêm chương
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
            setComicId(''); setChapterNumber(''); setChapterTitle('');
            setChapterImageFiles(null); setChapterImageUrls([]); setChapterPrice(0); setUploadProgress(0);
        } catch (error: any) {
            console.error("Submit chapter error:", error);
            showNotification(`Lỗi thêm chương: ${error.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
         <form onSubmit={handleSubmitChapter} style={{ border: '1px solid #ccc', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h3>Thêm Chương Mới</h3>
            <label>ID Truyện Cha: <input type="number" value={comicId} onChange={e => setComicId(e.target.value)} required /></label>
            <label>Số Chương (vd: 1, 1.5): <input type="number" step="0.1" value={chapterNumber} onChange={e => setChapterNumber(e.target.value)} required /></label>
            <label>Tiêu đề chương (tùy chọn): <input type="text" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} /></label>
            <label>Ảnh nội dung ({chapterImageUrls.length} ảnh đã upload):
                <input type="file" accept="image/*" multiple onChange={handleChapterImagesChange} style={{ marginLeft: '5px' }}/>
                <button type="button" onClick={handleUploadChapterImages} disabled={!chapterImageFiles || chapterImageFiles.length === 0 || isUploadingChapters || chapterImageUrls.length > 0} style={{ marginLeft: '10px' }}>
                    {isUploadingChapters ? `Đang tải (${uploadProgress.toFixed(0)}%)...` : (chapterImageUrls.length > 0 ? `Đã tải ${chapterImageUrls.length} ảnh ✓` : 'Upload ảnh chương')}
                </button>
            </label>
            {isUploadingChapters && <progress value={uploadProgress} max="100" style={{ width: '100%' }} />}
            <label>Giá Xu (0 = Miễn phí): <input type="number" value={chapterPrice} onChange={e => setChapterPrice(Number(e.target.value) || 0)} /></label>
            <button type="submit" disabled={isSubmitting || chapterImageUrls.length === 0 || isUploadingChapters}>
                {isSubmitting ? 'Đang thêm...' : 'Thêm Chương'}
            </button>
        </form>
    );
};


// --- AdminPage Component ---
const AdminPage: React.FC = () => {
    const { currentUser } = useAuth();
    // *** Quan trọng: Thêm logic kiểm tra quyền Admin thực sự ở đây ***
    // Ví dụ đơn giản: Kiểm tra email hoặc thêm trường 'role' vào user
    const isAdmin = currentUser?.email === 'admin@123'; // Thay bằng logic của bạn

    if (!currentUser) {
         return <div>Vui lòng đăng nhập với tài khoản Admin.</div>;
    }
    if (!isAdmin) {
        return <div>Bạn không có quyền truy cập trang này.</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
            <h2>Trang Quản Trị StoryVerse</h2>
            <AddComicForm />
            <AddChapterForm />
            {/* Thêm các form quản lý khác nếu cần */}
        </div>
    );
};

export default AdminPage;