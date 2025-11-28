import React, { useState, useEffect } from 'react';
import { FiFilter, FiRotateCcw } from 'react-icons/fi';
import '../../assets/styles/FilterSidebar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
    minPrice?: number;
    maxPrice?: number;
}

interface FilterSidebarProps {
    filters: FilterState;
    onFilterChange: (newFilters: FilterState) => void;
    showPriceFilter: boolean;
    sortOption: string;
    onSortChange: (sort: string) => void;
}

interface Genre {
    id: number;
    name: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ filters, onFilterChange, showPriceFilter, sortOption, onSortChange }) => {
    const [allGenres, setAllGenres] = useState<string[]>([]);
    const [allAuthors, setAllAuthors] = useState<string[]>([]);
    
    const MIN_GAP = 50000; 
    const MAX_RANGE = 2000000; 

    useEffect(() => {
        fetch(`${API_URL}/comics/system/genres`)
            .then(res => res.json())
            .then((data: Genre[]) => {
                setAllGenres(data.map(g => g.name).sort());
            })
            .catch(() => setAllGenres([]));

        fetch(`${API_URL}/comics?limit=1000`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch comics');
                return res.json();
            })
            .then(rawData => {
                let comicsArray: any[] = [];
                if (Array.isArray(rawData)) comicsArray = rawData;
                else if (rawData.data) comicsArray = rawData.data;
                else if (rawData.comics) comicsArray = rawData.comics;

                const uniqueAuthors = Array.from(new Set(
                    comicsArray
                        .map((comic: any) => comic.author)
                        .filter((author: any) => typeof author === 'string' && author.trim() !== '')
                )).sort();

                setAllAuthors(uniqueAuthors as string[]);
            })
            .catch(err => {
                console.error("Lỗi lấy danh sách tác giả:", err);
                setAllAuthors([]);
            });
    }, []);

    const handleGenreToggle = (genre: string) => {
        const newGenres = filters.genres.includes(genre)
            ? filters.genres.filter(g => g !== genre)
            : [...filters.genres, genre];
        onFilterChange({ ...filters, genres: newGenres });
    };

    const handleAuthorToggle = (author: string) => {
        const newAuthors = filters.authors.includes(author)
            ? filters.authors.filter(a => a !== author)
            : [...filters.authors, author];
        onFilterChange({ ...filters, authors: newAuthors });
    };

    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
        const value = parseInt(e.target.value);
        const minVal = filters.minPrice || 0;
        const maxVal = filters.maxPrice || MAX_RANGE;

        if (type === 'min') {
            if (value <= maxVal - MIN_GAP) onFilterChange({ ...filters, minPrice: value });
        } else {
            if (value >= minVal + MIN_GAP) onFilterChange({ ...filters, maxPrice: value });
        }
    };

    const minPercent = ((filters.minPrice || 0) / MAX_RANGE) * 100;
    const maxPercent = ((filters.maxPrice || MAX_RANGE) / MAX_RANGE) * 100;

    const handleReset = () => {
        onFilterChange({
            authors: [],
            genres: [],
            mediaType: filters.mediaType,
            minPrice: 0,
            maxPrice: MAX_RANGE
        });
        onSortChange('newest'); 
    };

    const formatPrice = (price?: number) => {
        return price ? price.toLocaleString('vi-VN') + 'đ' : '0đ';
    };

    return (
        <aside className="filter-sidebar">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--clr-border-light)', paddingBottom: '15px'}}>
                <h2 style={{fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FiFilter /> Bộ lọc
                </h2>
                <button onClick={handleReset} style={{background: 'none', border: 'none', color: 'var(--clr-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem'}}>
                    <FiRotateCcw /> Đặt lại
                </button>
            </div>

            <div className="sidebar-section">
                <h3>Sắp xếp theo</h3>
                <div className="sort-options">
                    <label className="sort-item">
                        <input type="radio" name="sort" value="newest" checked={sortOption === 'newest'} onChange={() => onSortChange('newest')} />
                        Mới nhất
                    </label>
                    <label className="sort-item">
                        <input type="radio" name="sort" value="oldest" checked={sortOption === 'oldest'} onChange={() => onSortChange('oldest')} />
                        Cũ nhất
                    </label>
                    
                    {showPriceFilter && (
                        <>
                            <label className="sort-item">
                                <input type="radio" name="sort" value="price-asc" checked={sortOption === 'price-asc'} onChange={() => onSortChange('price-asc')} />
                                Giá: Thấp đến Cao
                            </label>
                            <label className="sort-item">
                                <input type="radio" name="sort" value="price-desc" checked={sortOption === 'price-desc'} onChange={() => onSortChange('price-desc')} />
                                Giá: Cao đến Thấp
                            </label>
                        </>
                    )}

                    <label className="sort-item">
                        <input type="radio" name="sort" value="title-asc" checked={sortOption === 'title-asc'} onChange={() => onSortChange('title-asc')} />
                        Tên: A - Z
                    </label>
                    <label className="sort-item">
                        <input type="radio" name="sort" value="title-desc" checked={sortOption === 'title-desc'} onChange={() => onSortChange('title-desc')} />
                        Tên: Z - A
                    </label>
                </div>
            </div>

            {showPriceFilter && (
                <div className="sidebar-section">
                    <h3>Khoảng giá</h3>
                    <div className="price-slider-wrapper">
                        <div className="price-slider-container">
                            <div className="slider-track"></div>
                            <div className="slider-range" style={{left: `${minPercent}%`, width: `${maxPercent - minPercent}%`}}></div>
                            <input type="range" min="0" max={MAX_RANGE} step="10000" value={filters.minPrice || 0} onChange={(e) => handleRangeChange(e, 'min')} className="range-input" />
                            <input type="range" min="0" max={MAX_RANGE} step="10000" value={filters.maxPrice || MAX_RANGE} onChange={(e) => handleRangeChange(e, 'max')} className="range-input" />
                        </div>
                        <div className="price-values">
                            <span>{formatPrice(filters.minPrice || 0)}</span>
                            <span>{formatPrice(filters.maxPrice || MAX_RANGE)}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="sidebar-section">
                <h3>Thể loại</h3>
                <div className="checkbox-list">
                    {allGenres.length === 0 ? <p style={{fontStyle:'italic', color:'#888', fontSize:'0.9rem'}}>Đang tải...</p> : allGenres.map(genre => (
                        <label key={genre} className="checkbox-item">
                            <input type="checkbox" checked={filters.genres.includes(genre)} onChange={() => handleGenreToggle(genre)} />
                            {genre}
                        </label>
                    ))}
                </div>
            </div>

            <div className="sidebar-section">
                <h3>Tác giả</h3>
                <div className="checkbox-list">
                    {allAuthors.length === 0 ? <p style={{fontStyle:'italic', color:'#888', fontSize:'0.9rem'}}>Đang tải...</p> : allAuthors.map(author => (
                        <label key={author} className="checkbox-item">
                            <input type="checkbox" checked={filters.authors.includes(author)} onChange={() => handleAuthorToggle(author)} />
                            {author}
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;