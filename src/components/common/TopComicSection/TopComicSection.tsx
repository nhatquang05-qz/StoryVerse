import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { digitalComics, type Comic } from '../../../data/mockData';
import StarRating from '../StarRating';
import './TopComicSection.css';

const formatViewCountSimple = (count: number): string => {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(0) + 'K';
    }
    return count.toString();
};

const TopComicsSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'day' | 'week' | 'month'>('week');

    const topComics = useMemo(() => {
        return [...digitalComics]
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 5);
    }, [digitalComics]); 

    const currentDate = useMemo(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return today.toLocaleDateString('vi-VN', options); 
    }, []); 

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

            <div className="top-comics-list">
                {topComics.map((comic, index) => (
                    <Link to={`/comic/${comic.id}`} key={comic.id} className="top-comic-item">
                        <span className={`rank-badge rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                        <img src={comic.imageUrl} alt={comic.title} className="comic-thumbnail" />
                        <div className="comic-info">
                            <h3 className="comic-title">{comic.title}</h3>
                            <div className="comic-meta">
                                <StarRating rating={comic.rating} />
                                <span className="view-count">{formatViewCountSimple(comic.viewCount)} lượt xem</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TopComicsSection;