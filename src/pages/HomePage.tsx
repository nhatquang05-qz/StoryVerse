// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import Hero from '../components/common/Hero/Hero';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
// Bỏ mockData, import kiểu dữ liệu chuẩn
import { type ComicSummary } from '../types/comicTypes'; 
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import FeaturedTagsSection from '../components/common/FeaturedTagsSection/FeaturedTagsSection';
import TopComicsSection from '../components/common/TopComicSection/TopComicSection';
import TopMembersSection from '../components/common/TopMembersSection/TopMembersSection';
import ChatLog from '../components/common/Chat/ChatLog';
import './HomePage.css';

const ITEMS_PER_SECTION_PAGE = 14;
// Đảm bảo API_URL này đúng
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// HomeSection chấp nhận kiểu dữ liệu ComicSummary
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
            {/* Sử dụng 'as any[]' để ProductList có thể chấp nhận kiểu dữ liệu mới */}
            {isLoading ? <LoadingSkeleton count={ITEMS_PER_SECTION_PAGE} /> : <ProductList comics={currentComics as any[]} />}
        </div>
    );
};


const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    
    // State để lưu dữ liệu từ API
    const [newReleasesComics, setNewReleasesComics] = useState<ComicSummary[]>([]);
    const [recommendedDigitalComics, setRecommendedDigitalComics] = useState<ComicSummary[]>([]);
    const [trendingComics, setTrendingComics] = useState<ComicSummary[]>([]);

    useEffect(() => {
        const fetchAllComics = async () => {
            setIsLoading(true);
            try {
                // Gọi API backend
                const response = await fetch(`${API_URL}/comics`); 
                if (!response.ok) {
                    throw new Error('Không thể tải truyện từ backend');
                }
                const allComics: ComicSummary[] = await response.json();

                // Lọc và sắp xếp dữ liệu từ API
                
                // Mới Phát Hành: Sắp xếp theo 'updatedAt' mới nhất
                setNewReleasesComics(
                    [...allComics].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 15)
                );

                // Đề xuất Digital: Lọc truyện Digital
                setRecommendedDigitalComics(
                    allComics.filter(c => c.isDigital).slice(0, 10)
                );

                // Bán Chạy (Trending): Sắp xếp theo 'viewCount' cao nhất
                setTrendingComics(
                    [...allComics].sort((a, b) => b.viewCount - a.viewCount).slice(0, 12)
                );

            } catch (error) {
                console.error("Lỗi khi tải truyện:", error);
            } finally {
                // Giữ một chút delay để UI mượt hơn
                setTimeout(() => setIsLoading(false), 500); 
            }
        };
        
        fetchAllComics();
    }, []); // Mảng rỗng đảm bảo chỉ gọi 1 lần

    return (
        <React.Fragment>
            <Hero />

            <div style={{ marginTop: '3rem' }}>
                <HomeSection
                    title="Mới Phát Hành (Tất Cả)"
                    comics={newReleasesComics}
                    isLoading={isLoading}
                />
            </div>

            <FeaturedTagsSection />
            <div className="top-and-chat-section">
                <div className="chat-column">
                   {!isLoading && <ChatLog />}
                   {isLoading && (
                       <div className="skeleton-placeholder-chat" style={{ height: '700px', backgroundColor: 'var(--clr-card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--clr-border-light)', padding: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out', marginBottom: '2rem' }}></div>
                   )}
                   <HomeSection
                        title="Truyện Digital Đề Xuất"
                        comics={recommendedDigitalComics}
                        isLoading={isLoading}
                        addSpacing={true}
                    />
                </div>

                 <aside className="top-comics-column">
                     {!isLoading && <TopComicsSection />}
                     {!isLoading && <TopMembersSection />}
                     {isLoading && (
                         <div className="skeleton-placeholder-sidebar" style={{ height: '500px', backgroundColor: 'var(--clr-card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--clr-border-light)', padding: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                     )}
                </aside>
            </div>
            <HomeSection
                title="Truyện Bán Chạy" // Đổi tên cho phù hợp
                comics={trendingComics}
                isLoading={isLoading}
            />        
        </React.Fragment>
    );
};

export default HomePage;