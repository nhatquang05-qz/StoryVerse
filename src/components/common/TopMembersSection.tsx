import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquivalentLevelTitle as getLevelTitleUtil } from '../../utils/authUtils'; 
import '../../assets/styles/TopMembersSection.css';
import { FiLoader } from 'react-icons/fi';
import top1Image from '../../assets/images/top1.avif'; 
import top2Image from '../../assets/images/top2.avif';
import top3Image from '../../assets/images/top3.avif'; 
import defaultAvatarImg from '../../assets/images/defaultAvatar.webp'; 
import UserDetailModal from './UserDetailModal'; 

interface TopMember {
    id: string;
    fullName: string;
    level: number;
    avatarUrl?: string; 
    score?: number;
    levelSystem: string; 
}

interface RawTopMember {
    id: string | number;
    fullName: string;
    level: string | number;
    avatarUrl?: string;
    score?: string | number;
    levelSystem?: string;
}

const TopMembersSection: React.FC = () => {
    const [topMembers, setTopMembers] = useState<TopMember[]>([]);
    const [apiLoading, setApiLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);    
    const [selectedUserProfileId, setSelectedUserProfileId] = useState<string | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const { getLevelColor, loading: authLoading } = useAuth();

    const getAvatarSrc = (url: string | null | undefined) => {
        if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
        return url;
    };

    const handleUserClick = (userId: string) => {
        setSelectedUserProfileId(userId);
        setIsUserModalOpen(true);
    };

    useEffect(() => {
        const fetchTopMembers = async () => {
            setApiLoading(true);
            setError(null);
            try {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
                
                const response = await fetch(`${apiUrl}/users/top?limit=7`);
                
                if (!response.ok) {
                    let errorMsg = 'Không thể tải danh sách thành viên';
                    try {
                        const errorData = await response.json();
                        errorMsg = errorData.error || errorMsg;
                    } catch (jsonError) { }
                    throw new Error(errorMsg);
                }
                
                const rawData: RawTopMember[] = await response.json();
                
                const processedData = rawData.map(member => {
                    const level = parseInt(String(member.level));
                    const score = parseInt(String(member.score));
                    
                    const systemKey = (member.levelSystem && member.levelSystem !== 'default') 
                                      ? member.levelSystem 
                                      : 'Bình Thường';

                    return {
                        id: String(member.id),
                        fullName: member.fullName || 'Người dùng ẩn danh',
                        level: !isNaN(level) && level >= 1 ? level : 1,
                        avatarUrl: member.avatarUrl || 'https://via.placeholder.com/45', 
                        score: !isNaN(score) ? score : undefined,
                        levelSystem: systemKey 
                    }
                }).filter(member => member !== null) as TopMember[];

                setTopMembers(processedData);
            } catch (err) {
                console.error("Lỗi tải top members:", err);
                let detailedError = 'Failed to fetch top users';
                if (err instanceof Error) {
                    detailedError = err.message;
                }
                setError(`Lỗi: ${detailedError}`);
                setTopMembers([]);
            } finally {
                setApiLoading(false);
            }
        };

        fetchTopMembers();
    }, []);

    const isLoading = authLoading || apiLoading;

    const formatScore = (score: number | undefined) => {
        if (score === undefined) return '';
        return score.toLocaleString('vi-VN'); 
    };

    return (
        <div className="top-members-section">
            <h2 className="top-members-title">
                 Top thành viên 
            </h2>
            {isLoading && (
                <div className="loading-indicator">
                    <FiLoader className="animate-spin" /> Đang tải bảng xếp hạng...
                </div>
            )}
            {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
            {!isLoading && !error && topMembers.length === 0 && <p style={{ textAlign: 'center' }}>Chưa có dữ liệu xếp hạng.</p>}
            {!isLoading && !error && topMembers.length > 0 && (
                <ol className="top-members-list">
                    {topMembers.map((member, index) => {
                        if (!member || typeof member.level !== 'number' || member.level < 1) {
                            return null;
                        }

                        const rank = index + 1;
                        const levelColor = getLevelColor(member.level);
                        const levelTitle = getLevelTitleUtil(member.level, member.levelSystem);

                        let rankElement;
                        if (rank === 1) {
                            rankElement = (
                                <img 
                                    src={top1Image} alt="Top 1" className="rank-image rank-1-image"
                                    style={{ width: '40px', height: '40px', objectFit: 'contain' }} 
                                />
                            );
                        } else if (rank === 2) {
                            rankElement = (
                                <img 
                                    src={top2Image} alt="Top 2" className="rank-image rank-2-image"
                                    style={{ width: '35px', height: '35px', objectFit: 'contain' }}
                                />
                            );
                        } else if (rank === 3) {
                            rankElement = (
                                <img 
                                    src={top3Image} alt="Top 3" className="rank-image rank-3-image"
                                    style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                                />
                            );
                        } else {
                            rankElement = <span className="rank-number">{String(rank).padStart(2, '0')}</span>;
                        }

                        return (
                            <li key={member.id || index} className={`top-member-item`}>
                                <span className="member-rank">{rankElement}</span>

                                <img 
                                    src={getAvatarSrc(member.avatarUrl)} 
                                    alt={member.fullName} 
                                    className="member-avatar" 
                                    onClick={() => handleUserClick(member.id)}
                                    style={{ cursor: 'pointer' }}
                                    title="Xem trang cá nhân"
                                />

                                <div className="member-info">
                                    <span 
                                        className="member-name"
                                        onClick={() => handleUserClick(member.id)}
                                        style={{ cursor: 'pointer' }}
                                        title="Xem trang cá nhân"
                                    >
                                        {member.fullName}
                                    </span>
                                    <div className="member-stats">
                                        <span
                                            className="member-level-badge"
                                            style={{ backgroundColor: levelColor }}
                                            title={`Cấp ${member.level} - Hệ thống: ${member.levelSystem}`}
                                        >
                                            {levelTitle}
                                        </span>
                                        {member.score !== undefined && (
                                            <span className="member-score">
                                                {formatScore(member.score)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
             )}

            <UserDetailModal 
                userId={selectedUserProfileId}
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
            />
        </div>
    );
};

export default TopMembersSection;