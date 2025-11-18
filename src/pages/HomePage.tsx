import React, { useState, useEffect, useMemo } from 'react';
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

const ITEMS_PER_SECTION_PAGE = 14;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface HomeSectionProps {
    title: string;
    comics: ComicSummary[];
    isLoading: boolean;
    addSpacing?: boolean;
    showTabs?: boolean; 
}

const HomeSection: React.FC<HomeSectionProps> = ({ title, comics, isLoading, addSpacing = false, showTabs = false }) => {
    const [pageIndex, setPageIndex] = useState(0); 
    const [activeTab, setActiveTab] = useState<'physical' | 'digital'>('digital');

    const filteredComics = useMemo(() => {
        if (!showTabs) return comics;
        
        if (activeTab === 'physical') {
            return comics.filter(c => (c.isDigital as any) === 0);
        }
        return comics.filter(c => (c.isDigital as any) === 1);
        
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

    const sectionStyle: React.CSSProperties = addSpacing ? { marginTop: '2rem' } : { marginBottom: '4rem' };

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
                const response = await fetch(`${API_URL}/comics?limit=100`); 
                if (!response.ok) {
                    throw new Error('Không thể tải truyện từ backend');
                }
                
                const responseData = await response.json();
                const allComics: ComicSummary[] = Array.isArray(responseData) 
                    ? responseData 
                    : responseData.data || [];

                setNewReleasesComics(
                    [...allComics].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                );

                setRecommendedDigitalComics(
                    allComics.filter(c => (c.isDigital as any) === 1).slice(0, 10)
                );

                setTrendingComics(
                    [...allComics]
                        .filter(c => (c.isDigital as any) === 0) 
                        .sort((a, b) => ((b as any).viewCount ?? 0) - ((a as any).viewCount ?? 0)) 
                        .slice(0, 12) 
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
        </React.Fragment>
    );
};

export default HomePage;