import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom'; 
import '../../assets/styles/UserDetail.css';
import { FiX, FiCalendar, FiActivity, FiMessageCircle } from 'react-icons/fi';
import { getEquivalentLevelTitle, getLevelColor } from '../../utils/authUtils';
import { useAuth } from '../../contexts/AuthContext';
import defaultAvatarImg from '../../assets/images/defaultAvatar.webp';

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    comicTitle: string;
    comicCover: string;
    comicId: number;
    chapterNumber: number;
    chapterTitle?: string;
}

interface UserProfile {
    id: string;
    fullName: string;
    avatarUrl: string;
    level: number;
    levelSystem: string;
    joinDate: string;
    exp: number;
    recentComments: Comment[];
}

interface UserDetailModalProps {
    userId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, isOpen, onClose }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    useAuth();

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile(userId);
            
            document.body.style.overflow = 'hidden';
        } else {
            setProfile(null);
            document.body.style.overflow = 'unset';
        }

        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, userId]);

    const getAvatarSrc = (url: string | null | undefined) => {
        if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
        return url;
    };

    const fetchProfile = async (id: string) => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
            const res = await fetch(`${apiUrl}/users/profile/${id}`);
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    
    return ReactDOM.createPortal(
        <div className="udm-overlay" onClick={onClose}>
            <div className="udm-container" onClick={(e) => e.stopPropagation()}>
                <button className="udm-close-btn" onClick={onClose}>
                    <FiX size={24} />
                </button>

                {loading ? (
                    <div className="udm-loading">Đang tải thông tin...</div>
                ) : profile ? (
                    <>
                        <div className="udm-header">
                            <div className="udm-avatar-box">
                                <img src={getAvatarSrc(profile.avatarUrl)} alt={profile.fullName} />
                            </div>
                            <h2 className="udm-username">{profile.fullName}</h2>

                            <div
                                className="udm-level-tag"
                                style={{
                                    backgroundColor: getLevelColor(profile.level),
                                    boxShadow: `0 0 15px ${getLevelColor(profile.level)}80`,
                                }}
                            >
                                {getEquivalentLevelTitle(profile.level, profile.levelSystem)}
                            </div>

                            <div className="udm-meta-info">
                                <span className="udm-meta-item">
                                    <FiActivity /> Cấp {profile.level}
                                </span>
                                <span className="udm-meta-item">
                                    <FiCalendar /> Tham gia:{' '}
                                    {new Date(profile.joinDate).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                        </div>

                        <div className="udm-body">
                            <h3 className="udm-section-title">
                                <FiMessageCircle style={{ marginRight: '8px' }} />
                                Bình luận gần đây
                            </h3>
                            
                            {profile.recentComments && profile.recentComments.length > 0 ? (
                                <div className="udm-comments-list">
                                    {profile.recentComments.map((comment) => (
                                        <div key={comment.id} className="udm-comment-item">
                                            <img
                                                src={comment.comicCover}
                                                alt="comic"
                                                className="udm-comic-cover"
                                            />
                                            <div className="udm-comment-content">
                                                <div className="udm-comic-title">
                                                    {comment.comicTitle}
                                                    <span className="udm-chapter-num">
                                                        - Chapter {comment.chapterNumber}
                                                    </span>
                                                </div>
                                                <p className="udm-comment-text">"{comment.content}"</p>
                                                <span className="udm-date">
                                                    {new Date(comment.createdAt).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="udm-empty">
                                    Chưa có bình luận nào.
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="udm-error">Không tìm thấy thông tin người dùng.</div>
                )}
            </div>
        </div>,
        document.body 
    );
};

export default UserDetailModal;