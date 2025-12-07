import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Award, DollarSign, BookOpen, Users, Loader2 } from 'lucide-react';
import axios from 'axios'; 


import top1ComicBadge from '../assets/images/top1comic.avif';
import top2ComicBadge from '../assets/images/top2comic.avif';
import top3ComicBadge from '../assets/images/top3comic.avif';
import top1MemberBadge from '../assets/images/top1.avif';
import top2MemberBadge from '../assets/images/top2.avif';
import top3MemberBadge from '../assets/images/top3.avif';


import '../assets/styles/RankingPage.css';


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
	totalPoints: number; 
	rank: number;
};

type RankItem = ComicRankItem | MemberRankItem;

const rankingBadges = {
	comic: { 1: top1ComicBadge, 2: top2ComicBadge, 3: top3ComicBadge },
	member: { 1: top1MemberBadge, 2: top2MemberBadge, 3: top3MemberBadge },
};


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
				let url = `/api/rankings/${type}`;
				if (type !== 'member') {
					url += `?period=${period}`;
				}

				const response = await axios.get(url);

				
				const rankedData = response.data.map((item: any, index: number) => ({
					...item,
					rank: index + 1,
					coverImageUrl: item.coverImageUrl || '/default-image.webp', 
					avatarUrl: item.avatarUrl || '/default-avatar.webp', 
					
					totalViews: item.totalViews || 0,
					totalPurchases: item.totalPurches || 0,
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



const RankingItem: React.FC<{
	item: RankItem;
	type: RankingType;
}> = ({ item, type }) => {
	const rank = item.rank;
	const isTop3 = rank <= 3;
	const isMember = type === 'member';
    
	const badge = isMember 
        ? rankingBadges.member[rank as keyof typeof rankingBadges.member] 
        : rankingBadges.comic[rank as keyof typeof rankingBadges.comic]; 
    
    let infoText, metricValue, linkPrefix, coverOrAvatarUrl;

    if (isMember) {
        infoText = 'Tổng Điểm:';
        metricValue = (item as MemberRankItem).totalPoints.toLocaleString();
        linkPrefix = 'user';
        coverOrAvatarUrl = (item as MemberRankItem).avatarUrl;
    } else {
        const comicItem = item as ComicRankItem;
        linkPrefix = 'comic';
        coverOrAvatarUrl = comicItem.coverImageUrl;

        if (type === 'digital') {
            infoText = 'Lượt Đọc:';
            metricValue = comicItem.totalViews?.toLocaleString() || '0';
        } else { 
            infoText = 'Lượt Mua:';
            metricValue = comicItem.totalPurchases?.toLocaleString() || '0';
            linkPrefix = 'product'; 
        }
    }

    const titleOrUsername = isMember ? (item as MemberRankItem).username : (item as ComicRankItem).title;

	return (
		<Link to={`/${linkPrefix}/${item.id}`} className={`ranking-item ${isTop3 ? `rank-${rank}` : ''}`}>
			<div className="item-rank-indicator">
				{isTop3 ? (
					<img src={badge} alt={`Top ${rank} Badge`} className="rank-badge" />
				) : (
					<span className="rank-number">{rank}</span>
				)}
			</div>
			
            <div className={`item-cover-or-avatar ${isMember ? 'avatar' : 'cover'}`}>
				<img src={coverOrAvatarUrl} alt={titleOrUsername} />
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
};


const RankingSection: React.FC<{ 
    title: string; 
    icon: React.FC<any>; 
    type: RankingType;
}> = ({ title, icon: Icon, type }) => {
    
    const { data, loading, error, timeframe, setTimeframe } = useRankingData(type);
    
    const isComicType = type === 'digital' || type === 'physical';

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
                            onClick={() => setTimeframe(tf)}
                        >
                            {tf === 'day' && 'Hôm Nay'}
                            {tf === 'week' && 'Tuần Này'}
                            {tf === 'month' && 'Tháng Này'}
                        </button>
                    ))}
                </div>
            )}

            <div className="ranking-list">
                {loading && (
                    <div className="loading-spinner">
                        <Loader2 size={32} className="animate-spin" />
                        <p>Đang tải bảng xếp hạng...</p>
                    </div>
                )}
                {error && <p className="error-message">Lỗi: {error}</p>}
                
                {!loading && !error && data.length > 0 && (
                    data.map((item: RankItem) => (
                        <RankingItem 
                            key={item.id} 
                            item={item} 
                            type={type} 
                        />
                    ))
                )}
                
                {!loading && !error && data.length === 0 && (
                    <p className="no-data-message">Hiện chưa có dữ liệu xếp hạng trong kỳ này.</p>
                )}
			</div>
		</section>
	);
};


const RankingPage: React.FC = () => {
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
                />
                
                <hr className="ranking-divider" />

                <RankingSection
                    title="Truyện Giấy Bán Chạy"
                    icon={DollarSign}
                    type="physical"
                />

                <hr className="ranking-divider" />

                <RankingSection
                    title="Thành Viên Tích Cực"
                    icon={Users}
                    type="member"
                />
            </div>

            <div className="ranking-footer">
                <p>Cập nhật xếp hạng theo thời gian thực (Real-time). Dữ liệu tính toán dựa trên Lượt Đọc, Lượt Mua và Hoạt Động cộng đồng.</p>
            </div>
		</div>
	);
};

export default RankingPage;