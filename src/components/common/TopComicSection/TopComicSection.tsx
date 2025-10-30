import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating';
import './TopComicSection.css';
import { FiLoader } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface TopComic {
  id: number;
  title: string;
  coverImageUrl: string;
  averageRating: number | null;
  totalViewCount: number | null;
}

const formatViewCountSimple = (count: number | null | undefined): string => {
    const num = Number(count) || 0;
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
};

const TopComicsSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');
    const [topComics, setTopComics] = useState<TopComic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTopComics = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_URL}/comics/top-rated`);
                if (!response.ok) {
                    throw new Error('Không thể tải top truyện');
                }
                const data: TopComic[] = await response.json();
                setTopComics(data);
            } catch (err: any) {
                console.error("Lỗi tải top truyện:", err);
                setError(err.message || 'Lỗi không xác định');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTopComics();
    }, []); 

    const currentDate = useMemo(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('vi-VN', options); 
    }, []); 

    const renderContent = () => {
        if (isLoading) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <FiLoader className="animate-spin" style={{ fontSize: '2rem' }} />
                </div>
            );
        }

        if (error) {
            return <p style={{ textAlign: 'center', color: 'var(--clr-error-text)' }}>{error}</p>;
        }

        if (topComics.length === 0) {
            return <p style={{ textAlign: 'center' }}>Chưa có dữ liệu xếp hạng.</p>;
        }

        return (
            <div className="top-comics-list">
                {topComics.map((comic, index) => {
                    const displayRating = Number(comic.averageRating) || 0;
                    return (
                        <Link to={`/comic/${comic.id}`} key={comic.id} className="top-comic-item">
                            <span className={`rank-badge rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                            <img src={comic.coverImageUrl} alt={comic.title} className="comic-thumbnail" />
                            <div className="comic-info">
                                <h3 className="comic-title">{comic.title}</h3>
                                <div className="comic-meta">
                                    <StarRating rating={displayRating} />
                                    <span className="view-count">{formatViewCountSimple(comic.totalViewCount)} lượt xem</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="top-comics-section">
            <h2 className="section-title">TOP THEO DÕI</h2>
            <p className="section-subtitle">Truyện mới được cập nhật.</p>
            <p className="current-date-indicator">Ngày hiện tại: {currentDate}</p>

            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'day' ? 'active' : ''}`}
                    onClick={() => setActiveTab('day')}
                >
                    Ngày
                </button>
                <button
                    className={`tab-button ${activeTab === 'week' ? 'active' : ''}`}
                    onClick={() => setActiveTab('week')}
                >
                    Tuần
                </button>
                <button
                    className={`tab-button ${activeTab === 'month' ? 'active' : ''}`}
                    onClick={() => setActiveTab('month')}
                >
                    Tháng
                </button>
            </div>

            {renderContent()}
        </div>
    );
};

export default TopComicsSection;