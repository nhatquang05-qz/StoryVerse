import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiBookOpen, FiHeart } from 'react-icons/fi';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import { getEquivalentLevelTitle, getLevelColor } from '../../utils/authUtils'; 
import '../../assets/styles/CommunityModern.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CommunitySidebarLeft: React.FC = () => {
    const { currentUser, token } = useAuth(); 
    const [stats, setStats] = useState({ postCount: 0, totalLikes: 0 });

    useEffect(() => {
        if (currentUser?.id && token) {
            
            fetch(`${API_URL}/users/${currentUser.id}/community-stats`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => setStats(data))
            .catch(err => {
                console.error("Stats error:", err);
                
                setStats({ postCount: 0, totalLikes: 0 });
            });
        }
    }, [currentUser, token]);


    if (!currentUser) return null;

    const getAvatarSrc = (url: string | null | undefined) => {
        if (!url || url === 'defaultAvatar.webp') return defaultAvatar;
        return url;
    };

    
    const levelTitle = getEquivalentLevelTitle(currentUser.level, currentUser.levelSystem || 'Bình Thường');
    const levelColor = getLevelColor(currentUser.level);
    const isGlowing = currentUser.level >= 5; 

    return (
        <aside className="comm-sidebar-wrapper">
            <div className="comm-card">
                <div className="comm-profile-header">
                    <div className="comm-avatar-container">
                        <img 
                            src={getAvatarSrc(currentUser.avatarUrl)} 
                            alt={currentUser.fullName} 
                            className="comm-avatar"
                        />
                    </div>
                    <h3 className="comm-user-name">{currentUser.fullName}</h3>
                    
                    {}
                    <span 
                        className={`comm-level-badge ${isGlowing ? 'glowing' : ''}`}
                        style={{ 
                            backgroundColor: levelColor,
                            borderColor: levelColor,
                            boxShadow: `0 0 10px ${levelColor}80`
                        }}
                    >
                        {levelTitle}
                    </span>

                    <div className="comm-stats-row">
                        <div className="comm-stat-item">
                            <span className="comm-stat-value">{stats.postCount}</span>
                            <span className="comm-stat-label">Bài viết</span>
                        </div>
                        <div className="comm-stat-item">
                            <span className="comm-stat-value">{stats.totalLikes}</span>
                            <span className="comm-stat-label">Được thích</span>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <div className="comm-card" style={{padding: '10px'}}>
                <nav className="comm-nav-menu">
                    <button className="comm-nav-btn">
                        <FiBookOpen /> Truyện đang theo dõi
                    </button>
                    <button className="comm-nav-btn">
                        <FiHeart /> Bài viết đã thích
                    </button>
                </nav>
            </div>
        </aside>
    );
};

export default CommunitySidebarLeft;