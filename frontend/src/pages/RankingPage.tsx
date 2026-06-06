import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
	TrendingUp,
	DollarSign,
	BookOpen,
	Users,
	Crown,
	ChevronDown,
	ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
	getEquivalentLevelTitle as getLevelTitleUtil,
	getTextColorForBackground,
} from '../utils/authUtils';
import UserDetailModal from '../components/common/UserDetailModal';
import { FiLoader } from 'react-icons/fi';
import StarRating from '../components/common/StarRating';
import top1ComicBadge from '../assets/images/top1comic.avif';
import top2ComicBadge from '../assets/images/top2comic.avif';
import top3ComicBadge from '../assets/images/top3comic.avif';
import top1MemberBadge from '../assets/images/top1.avif';
import top2MemberBadge from '../assets/images/top2.avif';
import top3MemberBadge from '../assets/images/top3.avif';
import defaultAvatarImg from '../assets/images/defaultAvatar.webp';
import '../assets/styles/RankingPage.css';
import '../assets/styles/TopMembersSection.css';

type Timeframe = 'day' | 'week' | 'month';
type RankingType = 'digital' | 'physical' | 'member';

type RankItem = {
	id: number | string;
	title?: string;
	username?: string;
	fullName?: string;
	coverImageUrl?: string;
	avatarUrl?: string;
	totalViews?: number;
	totalPurchases?: number;
	totalPoints?: number;
	rank: number;
	level?: number;
	levelSystem?: string;
	author?: string;
	averageRating?: number;
};

const rankingBadges = {
	comic: { 1: top1ComicBadge, 2: top2ComicBadge, 3: top3ComicBadge },
	member: { 1: top1MemberBadge, 2: top2MemberBadge, 3: top3MemberBadge },
};

const INITIAL_GRID_ITEMS = 10;

const MAX_GRID_ITEMS = 100;

const getAvatarSrc = (url: string | null | undefined) => {
	if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
	return url;
};

const useRankingData = (initialType: RankingType) => {
	const [data, setData] = useState<RankItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [timeframe, setTimeframe] = useState<Timeframe>('week');

	const fetchData = useCallback(async (period: Timeframe, type: RankingType) => {
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

			const rankedData = response.data.map((item: any, index: number) => {
				let authorDisplay = 'Đang cập nhật';
				if (item.author && typeof item.author === 'string' && isNaN(Number(item.author))) {
					authorDisplay = item.author;
				}

				return {
					...item,
					rank: index + 1,
					coverImageUrl: item.coverImageUrl || '/default-image.webp',
					avatarUrl: item.avatarUrl || 'defaultAvatar.webp',
					fullName: item.fullName || item.username || 'Người dùng ẩn danh',
					level: parseInt(item.level) || 1,
					levelSystem: item.levelSystem || 'default',
					totalViews: parseInt(item.totalViews) || 0,
					totalPurchases: parseInt(item.totalPurchases) || 0,
					totalPoints: parseFloat(item.totalPoints) || 0,
					author: authorDisplay,
					averageRating: parseFloat(item.averageRating) || 0,
				};
			});

			setData(rankedData);
		} catch (err: any) {
			console.error(`Error fetching ${type} rankings:`, err);
			setError(err.response?.data?.error || `Lỗi khi tải dữ liệu ${type}.`);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (initialType === 'member') {
			fetchData('day', initialType);
		} else {
			fetchData(timeframe, initialType);
		}
	}, [timeframe, initialType, fetchData]);

	return { data, loading, error, timeframe, setTimeframe };
};

const RankingItem: React.FC<{
	item: RankItem;
	type: RankingType;
	onMemberClick?: (userId: number | string) => void;
	getLevelColor: (level: number) => string;
	variant?: 'podium' | 'list';
}> = ({ item, type, onMemberClick, getLevelColor, variant = 'list' }) => {
	const rank = item.rank;
	const isMember = type === 'member';

	const displayName = item.fullName || 'Người dùng ẩn danh';
	const memberAvatarSrc = getAvatarSrc(item.avatarUrl);
	const coverOrAvatarUrl = item.coverImageUrl;
	const title = item.title || 'Truyện chưa có tên';
	const level = item.level || 1;
	const levelColor = getLevelColor(level);
	const textColor = getTextColorForBackground(levelColor);
	const levelTitle = getLevelTitleUtil(level, item.levelSystem || 'default');
	const score = Math.floor(item.totalPoints || 0).toLocaleString('vi-VN');

	let metricValue, linkPrefix;
	linkPrefix = type === 'digital' ? 'comic' : 'product';

	if (type === 'digital') {
		metricValue = (item.totalViews || 0).toLocaleString('vi-VN');
	} else {
		metricValue = (item.totalPurchases || 0).toLocaleString('vi-VN');
	}

	if (variant === 'podium') {
		return (
			<div className={`rp-podium-card rp-rank-${rank} ${isMember ? 'rp-member-card' : ''}`}>
				<div className="rp-podium-rank-badge">
					{rank === 1 && (
						<Crown size={32} fill="#FFD700" color="#FFD700" className="rp-crown-icon" />
					)}
					<span className="rank-num">#{rank}</span>
				</div>

				<div
					className="rp-podium-img-container"
					onClick={isMember && onMemberClick ? () => onMemberClick(item.id) : undefined}
				>
					<img
						src={isMember ? memberAvatarSrc : coverOrAvatarUrl}
						alt={isMember ? displayName : title}
						className={isMember ? 'rp-podium-avatar' : 'rp-podium-cover'}
						onError={(e) => {
							(e.target as HTMLImageElement).src = isMember
								? defaultAvatarImg
								: '/default-image.webp';
						}}
					/>
					<img
						src={
							isMember
								? rankingBadges.member[rank as 1 | 2 | 3]
								: rankingBadges.comic[rank as 1 | 2 | 3]
						}
						alt={`Top ${rank}`}
						className="rp-podium-badge"
					/>
				</div>

				<div className="rp-podium-info">
					{isMember ? (
						<>
							<h3
								className="rp-podium-title"
								onClick={() => onMemberClick && onMemberClick(item.id)}
							>
								{displayName}
							</h3>
							<div
								className="rp-level-badge"
								style={{ backgroundColor: levelColor, color: textColor }}
							>
								{levelTitle}
							</div>
							<div className="rp-podium-metric">{score} Points</div>
						</>
					) : (
						<Link to={`/${linkPrefix}/${item.id}`} className="rp-podium-link">
							<h3 className="rp-podium-title">{title}</h3>
							<p className="rp-podium-author">{item.author}</p>
							<div className="rp-podium-stats">
								<div className="rp-podium-rating">
									<StarRating
										rating={item.averageRating || 0}
										size={12}
										maxStars={1}
									/>
									<span>{(item.averageRating || 0).toFixed(1)}</span>
								</div>
								<div className="rp-podium-metric">
									<TrendingUp size={14} />
									{metricValue}
								</div>
							</div>
						</Link>
					)}
				</div>
			</div>
		);
	}

	if (isMember) {
		return (
			<li
				key={item.id}
				className={`rp-grid-item rank-other`}
				onClick={() => onMemberClick && onMemberClick(item.id)}
			>
				<div className="rp-grid-rank">#{rank}</div>
				<img
					src={memberAvatarSrc}
					alt={displayName}
					className="rp-grid-avatar"
					onError={(e) => {
						(e.target as HTMLImageElement).src = defaultAvatarImg;
					}}
				/>
				<div className="rp-grid-info">
					<span className="rp-grid-title">{displayName}</span>
					<div className="rp-grid-meta">
						<span
							className="rp-mini-badge"
							style={{ backgroundColor: levelColor, color: textColor }}
						>
							{levelTitle}
						</span>
						<span className="rp-grid-score">{score} Point</span>
					</div>
				</div>
			</li>
		);
	} else {
		return (
			<Link to={`/${linkPrefix}/${item.id}`} className={`rp-grid-item rank-other`}>
				<div className="rp-grid-rank">#{rank}</div>
				<div className="rp-grid-cover">
					<img
						src={coverOrAvatarUrl}
						alt={title}
						onError={(e) => {
							(e.target as HTMLImageElement).src = '/default-image.webp';
						}}
					/>
				</div>
				<div className="rp-grid-info">
					<h3 className="rp-grid-title">{title}</h3>
					<p className="rp-grid-author">{item.author}</p>
					<div className="rp-grid-stats">
						<span className="rp-grid-rating">
							<StarRating rating={item.averageRating || 0} size={12} maxStars={1} />{' '}
							{(item.averageRating || 0).toFixed(1)}
						</span>
						<span className="rp-grid-metric">
							<TrendingUp size={12} /> {metricValue}
						</span>
					</div>
				</div>
			</Link>
		);
	}
};

const RankingSection: React.FC<{
	title: string;
	icon: React.FC<any>;
	type: RankingType;
	onMemberClick?: (userId: number | string) => void;
	getLevelColor: (level: number) => string;
}> = ({ title, icon: Icon, type, onMemberClick, getLevelColor }) => {
	const { data, loading, error, timeframe, setTimeframe } = useRankingData(type);

	const [visibleGridCount, setVisibleGridCount] = useState(INITIAL_GRID_ITEMS);

	const isComicType = type === 'digital' || type === 'physical';

	const top3Data = data.slice(0, 3);

	const restData = data.slice(3, 3 + visibleGridCount);

	const podiumSorted = [
		top3Data.find((d) => d.rank === 2),
		top3Data.find((d) => d.rank === 1),
		top3Data.find((d) => d.rank === 3),
	].filter(Boolean) as RankItem[];

	const isExpandedLimit =
		3 + visibleGridCount >= data.length || visibleGridCount >= MAX_GRID_ITEMS;

	const showLoadMoreButton =
		data.length > 3 + INITIAL_GRID_ITEMS || visibleGridCount > INITIAL_GRID_ITEMS;

	const handleLoadMore = () => {
		if (isExpandedLimit) {
			setVisibleGridCount(INITIAL_GRID_ITEMS);

			const section = document.getElementById(`section-${type}`);
			if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			setVisibleGridCount((prev) => prev + 10);
		}
	};

	return (
		<section className="rp-section" id={`section-${type}`}>
			<div className="rp-section-header">
				<Icon size={28} className="rp-header-icon" />
				<h2 className="rp-section-title">{title}</h2>
			</div>

			{isComicType && (
				<div className="rp-tabs">
					{(['day', 'week', 'month'] as Timeframe[]).map((tf) => (
						<button
							key={tf}
							className={`rp-tab-btn ${timeframe === tf ? 'active' : ''}`}
							onClick={() => {
								setTimeframe(tf);
								setVisibleGridCount(INITIAL_GRID_ITEMS);
							}}
						>
							{tf === 'day' && 'Hôm Nay'}
							{tf === 'week' && 'Tuần Này'}
							{tf === 'month' && 'Tháng Này'}
						</button>
					))}
				</div>
			)}

			{loading && (
				<div className="loading-spinner">
					<FiLoader size={32} className="animate-spin" />
					<p>Đang tải...</p>
				</div>
			)}
			{error && <p className="error-message">{error}</p>}
			{!loading && !error && data.length === 0 && (
				<p className="no-data-message">Chưa có dữ liệu xếp hạng.</p>
			)}

			{!loading && !error && data.length > 0 && (
				<div className="ranking-content-wrapper">
					<div className="rp-podium">
						{podiumSorted.map((item) => (
							<RankingItem
								key={item.id}
								item={item}
								type={type}
								variant="podium"
								onMemberClick={onMemberClick}
								getLevelColor={getLevelColor}
							/>
						))}
					</div>

					{restData.length > 0 && (
						<div className="rp-grid">
							{restData.map((item) => (
								<RankingItem
									key={item.id}
									item={item}
									type={type}
									variant="list"
									onMemberClick={onMemberClick}
									getLevelColor={getLevelColor}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{showLoadMoreButton && !loading && !error && (
				<div className="rp-load-more-container">
					<button onClick={handleLoadMore} className="rp-load-more-btn">
						{isExpandedLimit ? (
							<>
								Thu Gọn <ChevronUp size={16} style={{ marginLeft: 5 }} />
							</>
						) : (
							<>
								Xem Thêm (+10) <ChevronDown size={16} style={{ marginLeft: 5 }} />
							</>
						)}
					</button>
				</div>
			)}
		</section>
	);
};

const RankingPage: React.FC = () => {
	const { getLevelColor, loading: authLoading } = useAuth();
	const [selectedUserProfileId, setSelectedUserProfileId] = useState<number | string | null>(
		null,
	);
	const [isUserModalOpen, setIsUserModalOpen] = useState(false);

	const handleUserClick = (userId: number | string) => {
		setSelectedUserProfileId(userId);
		setIsUserModalOpen(true);
	};

	if (authLoading)
		return (
			<div className="loading-spinner">
				<FiLoader size={32} className="animate-spin" />
			</div>
		);

	return (
		<div className="rp-wrapper">
			<header className="rp-hero">
				<div className="rp-hero-content">
					<h1 className="rp-main-title">BẢNG XẾP HẠNG</h1>
					<p className="rp-subtitle">
						Vinh danh những tác phẩm nổi bật và cá nhân xuất sắc nhất StoryVerse
					</p>
				</div>
			</header>

			<div className="rp-container">
				<RankingSection
					title="Top Thành Viên"
					icon={Users}
					type="member"
					onMemberClick={handleUserClick}
					getLevelColor={getLevelColor}
				/>
				<div className="rp-spacer"></div>
				<RankingSection
					title="Truyện Online Hot"
					icon={BookOpen}
					type="digital"
					getLevelColor={getLevelColor}
				/>
				<div className="rp-spacer"></div>
				<RankingSection
					title="Truyện Giấy Bán Chạy"
					icon={DollarSign}
					type="physical"
					getLevelColor={getLevelColor}
				/>
			</div>

			<div className="rp-footer">
				<p>Bảng xếp hạng được cập nhật tự động theo thời gian thực.</p>
			</div>

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
