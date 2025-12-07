import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, DollarSign, BookOpen, Users } from 'lucide-react';
import axios from 'axios'; 

// Import utilities và components cần thiết từ TopMembersSection
import { useAuth } from '../contexts/AuthContext';
import {
	getEquivalentLevelTitle as getLevelTitleUtil,
	getTextColorForBackground,
} from '../utils/authUtils';
import UserDetailModal from '../components/common/UserDetailModal';
import { FiLoader } from 'react-icons/fi'; // Sử dụng FiLoader cho đồng bộ UI loading

// Import badges
import top1ComicBadge from '../assets/images/top1comic.avif';
import top2ComicBadge from '../assets/images/top2comic.avif';
import top3ComicBadge from '../assets/images/top3comic.avif';
import top1MemberBadge from '../assets/images/top1.avif'; 
import top2MemberBadge from '../assets/images/top2.avif'; 
import top3MemberBadge from '../assets/images/top3.avif'; 

// Import defaultAvatarImg cho consistency
import defaultAvatarImg from '../assets/images/defaultAvatar.webp';

// Import CSS
import '../assets/styles/RankingPage.css';
import '../assets/styles/TopMembersSection.css'; // Quan trọng: Đảm bảo đã import CSS này cho Member UI

// --- TYPE DEFINITIONS ---
type Timeframe = 'day' | 'week' | 'month';
type RankingType = 'digital' | 'physical' | 'member';

type ComicRankItem = {
	id: number;
	title: string;
	coverImageUrl: string; 
	totalViews?: number; 
	totalPurchases?: number; 
	rank: number;
	isDigital: boolean;
};

type MemberRankItem = {
	id: number;
	username: string;
	avatarUrl: string; 
	totalPoints: number; // Exp được alias thành totalPoints từ backend
	rank: number;
    fullName: string;
    level: number; // Cần thiết cho styling level badge
    levelSystem: string; // Cần thiết cho styling level badge
};

type RankItem = ComicRankItem | MemberRankItem;

const rankingBadges = {
	comic: { 1: top1ComicBadge, 2: top2ComicBadge, 3: top3ComicBadge },
	member: { 1: top1MemberBadge, 2: top2MemberBadge, 3: top3MemberBadge },
};

const INITIAL_DISPLAY_LIMIT = 10; // Giới hạn hiển thị ban đầu

const getAvatarSrc = (url: string | null | undefined) => {
    if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
    return url;
};

// --- CUSTOM HOOK CHO API FETCHING ---
const useRankingData = (initialType: RankingType) => {
	const [data, setData] = useState<RankItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [timeframe, setTimeframe] = useState<Timeframe>('day');

	const fetchData = useCallback(
		async (period: Timeframe, type: RankingType) => {
			setLoading(true);
			setError(null);
			setData([]);

			try {
				let endpoint = type === 'member' ? 'members' : type; 
				let url = `/api/rankings/${endpoint}`;
                
				if (type !== 'member') {
					url += `?period=${period}`;
				}

				const response = await axios.get(url);

				const rankedData = response.data.map((item: any, index: number) => ({
					...item,
					rank: index + 1,
					// Sử dụng tên cột từ Model/Service backend
					coverImageUrl: item.coverImageUrl || '/default-image.webp', 
					avatarUrl: item.avatarUrl || '/default-avatar.webp', 
					// Đồng bộ tên field cho hiển thị
					totalViews: item.totalViews || 0,
					totalPurchases: item.totalPurchases || 0,
					totalPoints: parseFloat(item.totalPoints) || 0, // Dùng parseFloat cho exp
                    level: parseInt(item.level) || 1, 
                    levelSystem: item.levelSystem || 'Bình Thường', 
                    fullName: item.fullName || item.username || 'Người dùng ẩn danh',
				})) as RankItem[];

				setData(rankedData);
			} catch (err: any) {
				console.error(`Error fetching ${type} rankings:`, err);
				setError(err.response?.data?.error || `Lỗi khi tải dữ liệu ${type}.`);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		if (initialType === 'member') {
			fetchData('day', initialType); 
		} else {
			fetchData(timeframe, initialType);
		}
	}, [timeframe, initialType, fetchData]);

	return { data, loading, error, timeframe, setTimeframe };
};


// --- COMPONENT HIỂN THỊ ITEM ---
const RankingItem: React.FC<{
	item: RankItem;
	type: RankingType;
    onMemberClick?: (userId: number | string) => void;
    getLevelColor: (level: number) => string;
}> = ({ item, type, onMemberClick, getLevelColor }) => {
	const rank = item.rank;
	const isTop3 = rank <= 3;
	const isMember = type === 'member';
    
    // --- Member-Specific Render (Matching TopMembersSection visual structure) ---
    if (isMember) {
        const member = item as MemberRankItem;
        
        // Use utilities from AuthContext
        const levelColor = getLevelColor(member.level);
        const textColor = getTextColorForBackground(levelColor);
        const levelTitle = getLevelTitleUtil(member.level, member.levelSystem);
        const score = Math.floor(member.totalPoints).toLocaleString('vi-VN'); // Làm tròn exp để hiển thị

        let rankElement;
        if (rank === 1) {
            rankElement = <img src={rankingBadges.member[1]} alt="Top 1" className="rank-image rank-1-image" />;
        } else if (rank === 2) {
            rankElement = <img src={rankingBadges.member[2]} alt="Top 2" className="rank-image rank-2-image" />;
        } else if (rank === 3) {
            rankElement = <img src={rankingBadges.member[3]} alt="Top 3" className="rank-image rank-3-image" />;
        } else {
            // Dùng định dạng 01, 02 cho rank > 3
            rankElement = <span className="rank-number">{String(rank).padStart(2, '0')}</span>;
        }
        
        const titleOrUsername = member.fullName || member.username || 'Người dùng ẩn danh';

        // Sử dụng <li> với class top-member-item để tái sử dụng style từ TopMembersSection.css
        return (
            <li 
                key={member.id} 
                className={`top-member-item rank-${rank}`}
                onClick={() => onMemberClick && onMemberClick(member.id)}
            >
                <span className="member-rank">{rankElement}</span>

                <img
                    src={getAvatarSrc(member.avatarUrl)}
                    alt={titleOrUsername}
                    className="member-avatar"
                    title="Xem trang cá nhân"
                />

                <div className="member-info">
                    <span
                        className="member-name"
                        title="Xem trang cá nhân"
                    >
                        {titleOrUsername}
                    </span>
                    <div className="member-stats">
                        <span
                            className="member-level-badge"
                            style={{
                                backgroundColor: levelColor,
                                color: textColor,
                            }}
                            title={`Cấp ${member.level} - Hệ thống: ${member.levelSystem}`}
                        >
                            {levelTitle}
                        </span>
                        <span className="member-score">
                            {score}
                        </span>
                    </div>
                </div>
            </li>
        );

    } else { // Comic (Digital or Physical)
        const comicItem = item as ComicRankItem;
        let infoText, metricValue, linkPrefix;
        
        linkPrefix = 'comic';
        const coverOrAvatarUrl = comicItem.coverImageUrl;
        const titleOrUsername = comicItem.title;

        if (type === 'digital') {
            infoText = 'Lượt Đọc:';
            metricValue = comicItem.totalViews?.toLocaleString() || '0';
        } else { 
            infoText = 'Lượt Mua:';
            metricValue = comicItem.totalPurchases?.toLocaleString() || '0';
            linkPrefix = 'product'; 
        }

        const badge = rankingBadges.comic[rank as keyof typeof rankingBadges.comic];

        return (
            // Sử dụng Link cho comic/product
            <Link to={`/${linkPrefix}/${item.id}`} className={`ranking-item ${isTop3 ? `rank-${rank}` : ''}`}>
                <div className="item-rank-indicator">
                    {isTop3 ? (
                        <img src={badge} alt={`Top ${rank} Badge`} className="rank-badge" />
                    ) : (
                        <span className="rank-number">{rank}</span>
                    )}
                </div>
                
                <div className={`item-cover-or-avatar cover`}>
                    <img 
                        src={coverOrAvatarUrl} 
                        alt={titleOrUsername} 
                        onError={(e) => { 
                            const target = e.target as HTMLImageElement;
                            if(target.src !== '/default-image.webp') {
                                target.src = '/default-image.webp';
                            }
                        }}
                    />
                </div>

                <div className="item-details">
                    <h3 className="item-title">{titleOrUsername}</h3>
                    <p className="item-metric">
                        <TrendingUp size={16} className="metric-icon" />
                        {infoText} <span className={`metric-value ${isTop3 ? 'text-highlight-primary' : ''}`}>{metricValue}</span>
                    </p>
                </div>

                <div className="item-action">
                    <Award size={20} className="action-icon" />
                </div>
            </Link>
        );
    }
};

// --- COMPONENT HIỂN THỊ SECTION ---
const RankingSection: React.FC<{ 
    title: string; 
    icon: React.FC<any>; 
    type: RankingType;
    onMemberClick?: (userId: number | string) => void;
    getLevelColor: (level: number) => string;
}> = ({ title, icon: Icon, type, onMemberClick, getLevelColor }) => {
    
    const { data, loading, error, timeframe, setTimeframe } = useRankingData(type);
    const [showAll, setShowAll] = useState(false); 
    
    const isComicType = type === 'digital' || type === 'physical';
    
    const displayedData = showAll ? data : data.slice(0, INITIAL_DISPLAY_LIMIT);
    const hasMoreItems = data.length > INITIAL_DISPLAY_LIMIT && !showAll;


	return (
		<section className="ranking-section">
			<div className="section-header">
				<Icon size={32} className="header-icon" />
				<h2 className="section-title">{title}</h2>
			</div>

            {isComicType && (
                <div className="timeframe-tabs">
                    {(['day', 'week', 'month'] as Timeframe[]).map((tf) => (
                        <button
                            key={tf}
                            className={`tab-button ${timeframe === tf ? 'active' : ''}`}
                            onClick={() => {
                                setTimeframe(tf);
                                setShowAll(false); 
                            }}
                        >
                            {tf === 'day' && 'Hôm Nay'}
                            {tf === 'week' && 'Tuần Này'}
                            {tf === 'month' && 'Tháng Này'}
                        </button>
                    ))}
                </div>
            )}
            {/* Sử dụng div/ul phù hợp với từng loại hiển thị */}
            <div className={type === 'member' ? 'top-members-list' : 'ranking-list'}>
                {loading && (
                    <div className="loading-spinner">
                        <FiLoader size={32} className="animate-spin" />
                        <p>Đang tải bảng xếp hạng...</p>
                    </div>
                )}
                {error && <p className="error-message">Lỗi: {error}</p>}
                
                {/* Dùng ul/ol cho member list để tái sử dụng TopMembersSection style */}
                {!loading && !error && displayedData.length > 0 && (
                     type === 'member' 
                        ? <ol className="top-members-list-ol">
                            {displayedData.map((item: RankItem) => (
                                <RankingItem 
                                    key={item.id} 
                                    item={item} 
                                    type={type} 
                                    onMemberClick={onMemberClick}
                                    getLevelColor={getLevelColor}
                                />
                            ))}
                        </ol>
                        : displayedData.map((item: RankItem) => (
                            <RankingItem 
                                key={item.id} 
                                item={item} 
                                type={type} 
                                onMemberClick={onMemberClick}
                                getLevelColor={getLevelColor}
                            />
                        ))
                )}
                
                {!loading && !error && data.length === 0 && (
                    <p className="no-data-message">Hiện chưa có dữ liệu xếp hạng trong kỳ này.</p>
                )}
			</div>
            
            {/* Nút Xem Tất Cả */}
            {hasMoreItems && (
                <div className="text-center mt-6">
                    <button 
                        onClick={() => setShowAll(true)} 
                        className="cta-button show-all-button"
                    >
                        Xem Tất Cả ({data.length} mục)
                    </button>
                </div>
            )}
		</section>
	);
};


const RankingPage: React.FC = () => {
    // Cần useAuth để lấy getLevelColor
    const { getLevelColor, loading: authLoading } = useAuth(); 

    const [selectedUserProfileId, setSelectedUserProfileId] = useState<number | string | null>(null);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    const handleUserClick = (userId: number | string) => {
        setSelectedUserProfileId(userId);
        setIsUserModalOpen(true);
    };

    if (authLoading) {
        return <div className="loading-spinner"><FiLoader size={32} className="animate-spin" /><p>Đang tải dữ liệu người dùng...</p></div>;
    }

	return (
		<div className="ranking-page-wrapper">
			<header className="ranking-hero">
                <div className="hero-content">
                    <h1 className="main-title">BẢNG XẾP HẠNG</h1>
                    <p className="subtitle">Vinh danh những Truyện và Thành viên xuất sắc nhất vũ trụ StoryVerse</p>
                </div>
			</header>

            <div className="ranking-container">
                <RankingSection
                    title="Truyện Online Hot Nhất"
                    icon={BookOpen}
                    type="digital"
                    getLevelColor={getLevelColor} 
                />
                
                <hr className="ranking-divider" />

                <RankingSection
                    title="Truyện Giấy Bán Chạy"
                    icon={DollarSign}
                    type="physical"
                    getLevelColor={getLevelColor} 
                />

                <hr className="ranking-divider" />

                <RankingSection
                    title="Thành Viên Tích Cực"
                    icon={Users}
                    type="member"
                    onMemberClick={handleUserClick}
                    getLevelColor={getLevelColor} 
                />
            </div>

            <div className="ranking-footer">
                <p>Cập nhật xếp hạng theo thời gian thực (Real-time). Dữ liệu tính toán dựa trên Lượt Đọc, Lượt Mua và Hoạt Động cộng đồng.</p>
            </div>
            
            {/* Modal hiển thị chi tiết người dùng */}
            {isUserModalOpen && (
                <UserDetailModal
                    userId={selectedUserProfileId ? String(selectedUserProfileId) : null}
                    isOpen={isUserModalOpen}
                    onClose={() => setIsUserModalOpen(false)}
                />
            )}
		</div>
	);
};

export default RankingPage;