import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
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

export default AddComicForm;