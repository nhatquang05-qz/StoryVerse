import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { type ComicSummary, type ComicDetail, type Genre } from '../../types/comicTypes';
import { FiArrowLeft, FiLoader, FiSave, FiTrash2 } from 'react-icons/fi';
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

export default EditComicForm;