import React, { useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import Hero from '../components/common/Hero/Hero';
import { type ComicSummary } from '../types/comicTypes';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import FeaturedTagsSection from '../components/common/FeaturedTagsSection/FeaturedTagsSection';
import TopComicsSection from '../components/common/TopComicSection/TopComicSection';
import TopMembersSection from '../components/common/TopMembersSection/TopMembersSection';
import ChatLog from '../components/common/Chat/ChatLog';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import './HomePage.css';

const ITEMS_PER_SECTION_PAGE = 14;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const HomeSection: React.FC<{ title: string, comics: ComicSummary[], isLoading: boolean, addSpacing?: boolean }> = ({ title, comics, isLoading, addSpacing = false }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const totalItems = comics.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_SECTION_PAGE);
    const startIndex = pageIndex * ITEMS_PER_SECTION_PAGE;
    const endIndex = startIndex + ITEMS_PER_SECTION_PAGE;
    const currentComics = comics.slice(startIndex, endIndex);
    const handlePrev = () => setPageIndex(prev => Math.max(0, prev - 1));
    const handleNext = () => setPageIndex(prev => Math.min(totalPages - 1, prev + 1));

    const sectionStyle: React.CSSProperties = addSpacing ? { marginTop: '2rem' } : { marginBottom: '4rem' };

    return (
        <div style={sectionStyle}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 'bold' }}>{title}</h2>
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--clr-text-secondary)' }}>
                        Trang {pageIndex + 1}/{totalPages}
                    </span>
                    <div>
                        <button onClick={handlePrev} disabled={pageIndex === 0} className="detail-order-btn" style={{ padding: '0.5rem', marginRight: '0.5rem', width: '40px' }}>
                            <FiChevronLeft style={{ verticalAlign: 'middle' }} />
                        </button>
                        <button onClick={handleNext} disabled={pageIndex === totalPages - 1} className="detail-order-btn" style={{ padding: '0.5rem', width: '40px' }}>
                            <FiChevronRight style={{ verticalAlign: 'middle' }} />
                        </button>
                    </div>
                </div>
            )}
            {/* Đã xóa hoàn toàn LoadingSkeleton */}
            {isLoading ? (
                 <div className="skeleton-placeholder-chat" style={{ height: '500px', width: '100%', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
            ) : (
                <ProductList comics={currentComics as any[]} />
            )}
        </div>
    );
};


const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    
    const [newReleasesComics, setNewReleasesComics] = useState<ComicSummary[]>([]);
    const [recommendedDigitalComics, setRecommendedDigitalComics] = useState<ComicSummary[]>([]);
    const [trendingComics, setTrendingComics] = useState<ComicSummary[]>([]);

    useEffect(() => {
        const fetchAllComics = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_URL}/comics`); 
                if (!response.ok) {
                    throw new Error('Không thể tải truyện từ backend');
                }
                const allComics: ComicSummary[] = await response.json();

                setNewReleasesComics(
                    [...allComics].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 15)
                );

                setRecommendedDigitalComics(
                    allComics.filter(c => c.isDigital).slice(0, 10)
                );

                setTrendingComics(
                    [...allComics].sort((a, b) => b.viewCount - a.viewCount).slice(0, 12)
                );

            } catch (error) {
                console.error("Lỗi khi tải truyện:", error);
            } finally {
                setTimeout(() => setIsLoading(false), 500); 
            }
        };
        
        fetchAllComics();
    }, []);

    if (isLoading) {
        return <LoadingPage />;
    }

    return (
        <React.Fragment>
            <Hero />

            <div style={{ marginTop: '3rem' }}>
                <HomeSection
                    title="Mới Phát Hành (Tất Cả)"
                    comics={newReleasesComics}
                    isLoading={false}
                />
            </div>

            <FeaturedTagsSection />
            <div className="top-and-chat-section">
                <div className="chat-column">
                   <ChatLog />
                   <HomeSection
                        title="Truyện Digital Đề Xuất"
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
            />        
        </React.Fragment>
    );
};

export default HomePage;