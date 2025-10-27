// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import Hero from '../components/common/Hero/Hero';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import { type Comic, trendingComics, newReleasesComics, recommendedDigitalComics } from '../data/mockData';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import FeaturedTagsSection from '../components/common/FeaturedTagsSection/FeaturedTagsSection';
import TopComicsSection from '../components/common/TopComicSection/TopComicSection';
import ChatLog from '../components/common/Chat/ChatLog';
import './HomePage.css';

const ITEMS_PER_SECTION_PAGE = 14;

const HomeSection: React.FC<{ title: string, comics: Comic[], isLoading: boolean }> = ({ title, comics, isLoading }) => {
    const [pageIndex, setPageIndex] = useState(0);
    const totalItems = comics.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_SECTION_PAGE);
    const startIndex = pageIndex * ITEMS_PER_SECTION_PAGE;
    const endIndex = startIndex + ITEMS_PER_SECTION_PAGE;
    const currentComics = comics.slice(startIndex, endIndex);
    const handlePrev = () => setPageIndex(prev => Math.max(0, prev - 1));
    const handleNext = () => setPageIndex(prev => Math.min(totalPages - 1, prev + 1));

    return (
        <div style={{ marginBottom: '4rem' }}>
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
            {isLoading ? <LoadingSkeleton count={ITEMS_PER_SECTION_PAGE} /> : <ProductList comics={currentComics} />}
        </div>
    );
};


const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <Hero />

            <div style={{ marginTop: '3rem' }}>
                <HomeSection
                    title="Mới Phát Hành (Tất Cả)"
                    comics={newReleasesComics}
                    isLoading={isLoading}
                />
            </div>

            <FeaturedTagsSection />

            <div>
                 <HomeSection
                    title="Truyện In Bán Chạy"
                    comics={trendingComics}
                    isLoading={isLoading}
                 />
            </div>

            <div className="top-and-chat-section">
                <div className="chat-column">
                   {!isLoading && <ChatLog />}
                   {isLoading && (
                       <div className="skeleton-placeholder-chat" style={{ height: '500px', backgroundColor: 'var(--clr-card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--clr-border-light)', padding: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                   )}
                </div>
                 <aside className="top-comics-column">
                     {!isLoading && <TopComicsSection />}
                     {isLoading && (
                         <div className="skeleton-placeholder-sidebar" style={{ height: '500px', backgroundColor: 'var(--clr-card-bg)', borderRadius: 'var(--border-radius)', border: '1px solid var(--clr-border-light)', padding: '1.5rem', animation: 'pulse 1.5s infinite ease-in-out' }}></div>
                     )}
                </aside>
            </div>

            <div className="main-content-column" style={{ width: '100%' }}>
                <HomeSection
                    title="Truyện Digital Đề Xuất"
                    comics={recommendedDigitalComics}
                    isLoading={isLoading}
                />
            </div>

        </div>
    );
};

export default HomePage;