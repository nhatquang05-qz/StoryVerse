import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiBookOpen, FiHeart, FiStar, FiZap, FiTarget, FiUser, FiLogIn } from 'react-icons/fi';
import defaultAvatar from '../../assets/images/defaultAvatar.webp';
import '../../assets/styles/CommunityModern.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const CommunitySidebarLeft: React.FC = () => {
    const { currentUser, token, openLoginRequest } = useAuth();
    const [stats, setStats] = useState({ postCount: 0, receivedLikes: 0 });

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/community/my-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats:", err));
        }
    }, [token]);

    const getAvatar = (url: string | undefined) => 
        (url && url !== 'defaultAvatar.webp') ? url : defaultAvatar;

    // Hàm render Badge theo hệ thống cấp độ
    const renderLevelBadge = () => {
        const system = currentUser?.levelSystem || 'default';
        let badgeClass = 'badge-default';
        let Icon = FiUser;
        let label = 'Tân Thủ';

        switch (system) {
            case 'Tu Tiên':
                badgeClass = 'badge-tutien';
                Icon = FiZap; // Biểu tượng tia sét
                label = 'Tu Tiên Giả';
                break;
            case 'Ma Pháp':
                badgeClass = 'badge-maphap';
                Icon = FiStar; // Biểu tượng ngôi sao
                label = 'Ma Pháp Sư';
                break;
            case 'Khoa Huyễn':
                badgeClass = 'badge-khoahuyen';
                Icon = FiTarget; // Biểu tượng mục tiêu
                label = 'Đặc Vụ';
                break;
            default:
                badgeClass = 'badge-default';
                Icon = FiUser;
                label = 'Thành Viên';
        }

        return (
            <div className={`comm-level-badge ${badgeClass}`}>
                <Icon size={14} />
                <span>{label} • Lv.{currentUser?.level || 1}</span>
            </div>
        );
    };

    if (!currentUser) {
        return (
            <aside className="comm-sidebar-wrapper">
                <div className="comm-card" style={{textAlign: 'center'}}>
                    <h3 className="comm-widget-title" style={{justifyContent: 'center', border: 'none'}}>
                        StoryVerse Community
                    </h3>
                    <p style={{fontSize: '0.9rem', color: 'var(--clr-text-secondary)', marginBottom: '20px'}}>
                        Tham gia ngay để thảo luận, chia sẻ và nhận những phần quà hấp dẫn!
                    </p>
                    <button className="auth-button" style={{width: '100%', padding: '10px'}} onClick={openLoginRequest}>
                        <FiLogIn style={{marginRight: 8}} /> Đăng Nhập
                    </button>
                </div>
            </aside>
        );
    }

    return (
        <aside className="comm-sidebar-wrapper">
            {/* Profile Info Card */}
            <div className="comm-card">
                <div className="comm-profile-header">
                    <div className="comm-avatar-container">
                        <img 
                            src={getAvatar(currentUser.avatarUrl)} 
                            alt="User Avatar" 
                            className="comm-avatar" 
                        />
                    </div>
                    <h3 className="comm-user-name">{currentUser.fullName}</h3>
                    
                    {/* Badge Cấp Độ */}
                    {renderLevelBadge()}
                    
                    <div className="comm-stats-row">
                        <div className="comm-stat-item">
                            <span className="comm-stat-value">{stats.postCount}</span>
                            <span className="comm-stat-label">Bài viết</span>
                        </div>
                        <div className="comm-stat-item">
                            <span className="comm-stat-value">{stats.receivedLikes}</span>
                            <span className="comm-stat-label">Được thích</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Card */}
            <div className="comm-card" style={{padding: '10px'}}>
                <button className="comm-nav-btn">
                    <FiBookOpen />
                    <span>Truyện đang theo dõi</span>
                </button>
                <button className="comm-nav-btn">
                    <FiHeart />
                    <span>Bài viết đã thích</span>
                </button>
            </div>
        </aside>
    );
};

export default CommunitySidebarLeft;