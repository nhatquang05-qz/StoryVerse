import React, { useState, useEffect } from 'react';
import { FiX, FiFilter, FiSave } from 'react-icons/fi';
import { getUniqueAuthors, getUniqueGenres } from '../../data/mockData';
import '../../assets/styles/CategoryPage.css';

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
}

interface AdvancedFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    initialFilters: FilterState;
}

const AdvancedFilterModal: React.FC<AdvancedFilterModalProps> = ({ isOpen, onClose, onApply, initialFilters }) => {
    const [tempFilters, setTempFilters] = useState<FilterState>(initialFilters);
    const [allAuthors, setAllAuthors] = useState<string[]>([]);
    const [allGenres, setAllGenres] = useState<string[]>([]);

    useEffect(() => {
        setTempFilters(initialFilters);
        setAllAuthors(getUniqueAuthors().sort());
        setAllGenres(getUniqueGenres().sort());
    }, [initialFilters, isOpen]);

    if (!isOpen) return null;

    const handleGenreToggle = (genreName: string) => {
        setTempFilters(prev => ({
            ...prev,
            genres: prev.genres.includes(genreName)
                ? prev.genres.filter(g => g !== genreName)
                : [...prev.genres, genreName],
        }));
    };
    
    const handleAuthorToggle = (authorName: string) => {
        setTempFilters(prev => ({
            ...prev,
            authors: prev.authors.includes(authorName)
                ? prev.authors.filter(a => a !== authorName)
                : [...prev.authors, authorName],
        }));
    };

    const handleApplyClick = () => {
        onApply(tempFilters);
        onClose();
    };
    
    const handleResetClick = () => {
        setTempFilters({ authors: [], genres: [], mediaType: 'all' });
    };

    return (
        <div className="advanced-filter-modal-overlay" onClick={onClose}>
            <div className="advanced-filter-content" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close-btn" onClick={onClose}><FiX /></button>
                <h2><FiFilter style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Lọc Nâng Cao</h2>

                <div className="filter-group">
                    <h3>Loại Truyện</h3>
                    <div className="filter-options-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                        <label>
                            <input type="radio" name="mediaType" value="all" checked={tempFilters.mediaType === 'all'} onChange={() => setTempFilters(prev => ({ ...prev, mediaType: 'all' }))} style={{ display: 'none' }} />
                            <span>Tất cả</span>
                        </label>
                         <label>
                            <input type="radio" name="mediaType" value="digital" checked={tempFilters.mediaType === 'digital'} onChange={() => setTempFilters(prev => ({ ...prev, mediaType: 'digital' }))} style={{ display: 'none' }} />
                            <span>Truyện Online (Digital)</span>
                        </label>
                        <label>
                            <input type="radio" name="mediaType" value="physical" checked={tempFilters.mediaType === 'physical'} onChange={() => setTempFilters(prev => ({ ...prev, mediaType: 'physical' }))} style={{ display: 'none' }} />
                            <span>Truyện In (Physical)</span>
                        </label>
                    </div>
                </div>

                <div className="filter-group">
                    <h3>Thể Loại</h3>
                    <div className="filter-options-grid">
                        {allGenres.map(genre => (
                            <label key={genre}>
                                <input type="checkbox" checked={tempFilters.genres.includes(genre)} onChange={() => handleGenreToggle(genre)} style={{ display: 'none' }} />
                                <span>{genre}</span>
                            </label>
                        ))}
                    </div>
                </div>
                
                <div className="filter-group">
                    <h3>Tác Giả</h3>
                    <div className="filter-options-grid" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {allAuthors.map(author => (
                            <label key={author}>
                                <input type="checkbox" checked={tempFilters.authors.includes(author)} onChange={() => handleAuthorToggle(author)} style={{ display: 'none' }} />
                                <span>{author}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-actions">
                    <button onClick={handleResetClick} className="cancel-btn">Đặt Lại</button>
                    <button onClick={handleApplyClick} className="submit-review-btn">
                        <FiSave style={{ marginRight: '0.5rem' }} /> Áp Dụng Lọc
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdvancedFilterModal;