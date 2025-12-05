import React, { useEffect, useState } from 'react';
import { FiAward, FiTrendingUp, FiBook, FiHash, FiEye, FiEdit2 } from 'react-icons/fi';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import '../../assets/styles/CommunityModern.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface TopUser {
    id: number;
    fullName: string;
    avatarUrl: string;
    level: number;
    score: number;
}

interface SuggestedComic {
    id: number;
    title: string;
    coverImageUrl: string;
    author: string;
    viewCount: number;
}

const CommunitySidebarRight: React.FC = () => {
    const [topUsers, setTopUsers] = useState<TopUser[]>([]);
    const [comics, setComics] = useState<SuggestedComic[]>([]);

    useEffect(() => {
        // Lấy dữ liệu Top thành viên
        fetch(`${API_URL}/community/top-contributors`)
            .then(res => res.json())
            .then(data => setTopUsers(Array.isArray(data) ? data : []))
            .catch(console.error);

        // Lấy dữ liệu Truyện đề cử
        fetch(`${API_URL}/community/suggested-comics`)
            .then(res => res.json())
            .then(data => setComics(Array.isArray(data) ? data : []))
            .catch(console.error);
    }, []);

    const getAvatar = (url: string | null) => 
        (url && url !== 'defaultAvatar.webp') ? url : defaultAvatar;

    // Helper để render màu rank
    const getRankClass = (index: number) => {
        if (index === 0) return 'rank-gold';
        if (index === 1) return 'rank-silver';
        if (index === 2) return 'rank-bronze';
        return 'rank-normal';
    };

    return (
        <aside className="comm-sidebar-wrapper">
            {/* Widget: Top Contributors */}
            <div className="comm-card">
                <h4 className="comm-widget-title">
                    <FiAward /> Top Đóng Góp Tuần
                </h4>
                <div className="comm-top-list">
                    {topUsers.map((user, index) => (
                        <div key={user.id} className="comm-top-user">
                            <div className={`comm-rank-num ${getRankClass(index)}`}>
                                {index + 1}
                            </div>
                            <img 
                                src={getAvatar(user.avatarUrl)} 
                                alt={user.fullName} 
                                style={{width: 36, height: 36, borderRadius: '50%', objectFit: 'cover'}} 
                            />
                            <div className="comm-top-info">
                                <div className="comm-top-name" title={user.fullName}>{user.fullName}</div>
                                <div className="comm-top-detail">Level {user.level}</div>
                            </div>
                            <div className="comm-score">{user.score} pts</div>
                        </div>
                    ))}
                    {topUsers.length === 0 && (
                        <p style={{textAlign: 'center', color: 'var(--clr-text-secondary)', fontSize: '0.9rem'}}>Chưa có dữ liệu</p>
                    )}
                </div>
            </div>

            {/* Widget: Trending Tags */}
            <div className="comm-card">
                <h4 className="comm-widget-title">
                    <FiTrendingUp /> Chủ Đề Nóng
                </h4>
                <div className="comm-tags-container">
                    {[
                        'StoryVerse', 'ReviewTruyen', 'Spoiler', 
                        'TuTien', 'Anime', 'Manga', 'FanArt'
                    ].map(tag => (
                        <div key={tag} className="comm-tag">
                            <FiHash size={12} /> {tag}
                        </div>
                    ))}
                </div>
            </div>

            {/* Widget: Suggested Comics */}
            <div className="comm-card">
                <h4 className="comm-widget-title">
                    <FiBook /> Truyện Đề Cử
                </h4>
                <div className="comm-suggest-list">
                    {comics.map(comic => (
                        <div key={comic.id} className="comm-suggest-item" onClick={() => window.location.href = `/comics/${comic.id}`}>
                            <img src={comic.coverImageUrl} alt={comic.title} className="comm-suggest-cover" />
                            <div className="comm-suggest-info">
                                <h5>{comic.title}</h5>
                                <div className="comm-suggest-meta">
                                    <div><FiEdit2 size={10} /> {comic.author || 'Đang cập nhật'}</div>
                                    <div><FiEye size={10} /> {comic.viewCount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default CommunitySidebarRight;