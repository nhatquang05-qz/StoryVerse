import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductList from '../components/common/ProductList';
import Hero from '../components/common/Hero/Hero';
import { type ComicSummary } from '../types/comicTypes';
import Pagination from '../components/common/Pagination';
import FeaturedTagsSection from '../components/common/FeaturedTagsSection/FeaturedTagsSection';
import TopComicsSection from '../components/common/TopComicSection';
import TopMembersSection from '../components/common/TopMembersSection';
import ChatLog from '../components/common/Chat/ChatLog';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import '../assets/styles/HomePage.css';
import FlashSaleSection from '../components/common/FlashSaleSection';
import minigameBanner from '../assets/images/minigameChristmas/banner_minigame.webp';
import demonSlayerBanner from '../assets/images/banner/demon-slayer.webp';
import doraemonBanner from '../assets/images/banner/doraemon.webp';

const ITEMS_PER_SECTION_PAGE = 14;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface HomeSectionProps {
	title: string;
	comics: ComicSummary[];
	isLoading: boolean;
	addSpacing?: boolean;
	showTabs?: boolean;
}

const HomeSection: React.FC<HomeSectionProps> = ({
	title,
	comics,
	isLoading,
	addSpacing = false,
	showTabs = false,
}) => {
	const [pageIndex, setPageIndex] = useState(0);
	const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('digital');

	const filteredComics = useMemo(() => {
		if (!showTabs) return comics;

		if (activeTab === 'physical') {
			return comics.filter((c) => (c.isDigital as any) === 0);
		}
		return comics.filter((c) => (c.isDigital as any) === 1);
	}, [comics, activeTab, showTabs]);

	const totalItems = filteredComics.length;
	const totalPages = Math.ceil(totalItems / ITEMS_PER_SECTION_PAGE);

	useEffect(() => {
		if (pageIndex >= totalPages) {
			setPageIndex(Math.max(0, totalPages - 1));
		}
	}, [pageIndex, totalPages]);

	const startIndex = pageIndex * ITEMS_PER_SECTION_PAGE;
	const endIndex = startIndex + ITEMS_PER_SECTION_PAGE;
	const currentComics = filteredComics.slice(startIndex, endIndex);

	const handleTabClick = (tab: 'physical' | 'digital') => {
		setActiveTab(tab);
		setPageIndex(0);
	};

	const handlePageChange = (page: number) => {
		setPageIndex(page - 1);
	};

	const sectionStyle: React.CSSProperties = addSpacing
		? { marginTop: '2rem' }
		: { marginBottom: '4rem' };

	return (
		<div style={sectionStyle}>
			<div className="home-section-header">
				<h2 style={{ marginBottom: 0, fontSize: '2rem', fontWeight: 'bold' }}>{title}</h2>

				{showTabs && (
					<div className="home-section-tabs">
						<button
							className={`tab-button ${activeTab === 'digital' ? 'active' : ''}`}
							onClick={() => handleTabClick('digital')}
						>
							Truyện Online
						</button>
						<button
							className={`tab-button ${activeTab === 'physical' ? 'active' : ''}`}
							onClick={() => handleTabClick('physical')}
						>
							Truyện In
						</button>
					</div>
				)}

				{totalPages > 1 && (
					<div className="home-section-pagination">
						<Pagination
							currentPage={pageIndex + 1}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
				)}
			</div>

			{isLoading ? (
				<div
					className="skeleton-placeholder-chat"
					style={{
						height: '500px',
						width: '100%',
						animation: 'pulse 1.5s infinite ease-in-out',
					}}
				></div>
			) : (
				<ProductList comics={currentComics as any[]} />
			)}
		</div>
	);
};

const HomePage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	const [newReleasesComics, setNewReleasesComics] = useState<ComicSummary[]>([]);
	const [recommendedDigitalComics, setRecommendedDigitalComics] = useState<ComicSummary[]>([]);
	const [trendingComics, setTrendingComics] = useState<ComicSummary[]>([]);

	const [showLeftBanner, setShowLeftBanner] = useState(true);
	const [showRightBanner, setShowRightBanner] = useState(true);
	const leftBannerRef = useRef<HTMLDivElement>(null);
	const rightBannerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchAllComics = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`${API_URL}/comics?limit=100`);
				if (!response.ok) {
					throw new Error('Không thể tải truyện từ backend');
				}

				const responseData = await response.json();
				const allComics: ComicSummary[] = Array.isArray(responseData)
					? responseData
					: responseData.data || [];

				setNewReleasesComics(
					[...allComics].sort(
						(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
					),
				);

				setRecommendedDigitalComics(
					allComics.filter((c) => (c.isDigital as any) === 1).slice(0, 10),
				);

				setTrendingComics(
					[...allComics]
						.filter((c) => (c.isDigital as any) === 0)
						.sort((a, b) => ((b as any).soldCount ?? 0) - ((a as any).soldCount ?? 0)),
				);
			} catch (error) {
				console.error('Lỗi khi tải truyện:', error);
			} finally {
				setTimeout(() => setIsLoading(false), 500);
			}
		};

		fetchAllComics();
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const footer = document.querySelector('footer');
			if (!footer) return;

			const footerRect = footer.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			const banner = leftBannerRef.current || rightBannerRef.current;
			if (!banner) return;

			const bannerRect = banner.getBoundingClientRect();
			const bannerHeight = bannerRect.height;

			const bannerBottomPosition = viewportHeight / 2 + bannerHeight / 2;

			const footerTopPosition = footerRect.top;

			const gap = 10;

			let shiftAmount = 0;

			if (bannerBottomPosition > footerTopPosition - gap) {
				shiftAmount = bannerBottomPosition - (footerTopPosition - gap);
			}

			const transformValue = `translateY(calc(-50% - ${shiftAmount}px))`;

			if (leftBannerRef.current) {
				leftBannerRef.current.style.transform = transformValue;
			}
			if (rightBannerRef.current) {
				rightBannerRef.current.style.transform = transformValue;
			}
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleScroll);

		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	}, [showLeftBanner, showRightBanner, isLoading]);

	if (isLoading) {
		return <LoadingPage />;
	}

	return (
		<React.Fragment>
			<Hero />

			<div
				className="minigame-banner-section"
				style={{
					width: '100%',
					maxWidth: '1600px',
					margin: '20px auto 0',
					padding: '0 15px',
					boxSizing: 'border-box',
					cursor: 'pointer',
					userSelect: 'none',
					WebkitUserSelect: 'none',
				}}
				onClick={() => navigate('/christmas-event')}
			>
				<img
					src={minigameBanner}
					alt="Christmas Minigame Event"
					draggable={false}
					onContextMenu={(e) => e.preventDefault()}
					style={{
						width: '100%',
						height: 'auto',
						borderRadius: '12px',
						boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
						transition: 'transform 0.3s ease',
					}}
					onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.01)')}
					onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
				/>
			</div>
			{}

			<FlashSaleSection />
			<div style={{ marginTop: '3rem' }}>
				<HomeSection
					title="Mới Phát Hành"
					comics={newReleasesComics}
					isLoading={false}
					showTabs={true}
				/>
			</div>

			<FeaturedTagsSection />
			<div className="top-and-chat-section">
				<div className="chat-column">
					<ChatLog />
					<HomeSection
						title="Truyện Đề Xuất"
						comics={recommendedDigitalComics}
						isLoading={false}
						addSpacing={true}
					/>
				</div>

				<aside className="top-comics-column">
					<TopComicsSection />
					<TopMembersSection />
				</aside>
			</div>
			<HomeSection
				title="Truyện Bán Chạy"
				comics={trendingComics}
				isLoading={false}
				showTabs={false}
			/>

			{}
			{showLeftBanner && (
				<div className="side-banner left-banner" ref={leftBannerRef}>
					<button className="close-banner-btn" onClick={() => setShowLeftBanner(false)}>
						&times;
					</button>
					<img src={doraemonBanner} alt="Doraemon" />
				</div>
			)}

			{showRightBanner && (
				<div className="side-banner right-banner" ref={rightBannerRef}>
					<button className="close-banner-btn" onClick={() => setShowRightBanner(false)}>
						&times;
					</button>
					<img src={demonSlayerBanner} alt="Demon Slayer" />
				</div>
			)}
		</React.Fragment>
	);
};

export default HomePage;
