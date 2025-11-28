import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes'; 
import LoadingPage from '../components/common/Loading/LoadingScreen'; 
import FilterSidebar from '../components/common/FilterSidebar';
import Pagination from '../components/common/Pagination'; 
import '../assets/styles/FilterSidebar.css'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 12; 

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
    minPrice?: number;
    maxPrice?: number;
}

const SearchPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const initialMediaType = (searchParams.get('type') as any) || 'physical';

    const [allComics, setAllComics] = useState<ComicSummary[]>([]);
    const [filteredComics, setFilteredComics] = useState<ComicSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [filters, setFilters] = useState<FilterState>({ 
        authors: [], 
        genres: [], 
        mediaType: initialMediaType,
        minPrice: 0,
        maxPrice: 2000000 
    });

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const endpoint = query 
                    ? `${API_URL}/comics/search?q=${encodeURIComponent(query)}&limit=500`
                    : `${API_URL}/comics?limit=500`;

                const response = await fetch(endpoint);
                const rawData = await response.json();
                
                let comicsArray: any[] = [];
                if (Array.isArray(rawData)) comicsArray = rawData;
                else if (rawData.data) comicsArray = rawData.data;
                else if (rawData.comics) comicsArray = rawData.comics;

                const processedData: ComicSummary[] = comicsArray.map((comic: any) => ({
                    ...comic,
                    id: Number(comic.id),
                    isDigital: comic.isDigital === 1,
                    price: Number(comic.price),
                    randomSort: Math.random() 
                }));

                processedData.sort((a: any, b: any) => a.randomSort - b.randomSort);

                setAllComics(processedData);
            } catch (error) {
                console.error("Fetch error:", error);
                setAllComics([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [query]);

    useEffect(() => {
        let result = allComics;

        if (filters.mediaType === 'physical') {
            result = result.filter(c => !c.isDigital);
            if (filters.minPrice !== undefined) result = result.filter(c => c.price >= filters.minPrice!);
            if (filters.maxPrice !== undefined) result = result.filter(c => c.price <= filters.maxPrice!);
        } else if (filters.mediaType === 'digital') {
            result = result.filter(c => c.isDigital);
        }

        if (filters.authors.length > 0) {
            result = result.filter(c => c.author && filters.authors.includes(c.author));
        }

        if (filters.genres.length > 0) {
            result = result.filter(c => 
                c.genres && c.genres.some(g => filters.genres.includes(g.name))
            );
        }

        setFilteredComics(result);
        setCurrentPage(1); 
    }, [filters, allComics]);

    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = filteredComics.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredComics.length / ITEMS_PER_PAGE);

    if (isLoading) return <LoadingPage />;

    return (
        <div className="search-page-layout">
            <div className="main-content">
                <div className="category-header">
                    <h1>{query ? `Kết quả: "${query}"` : 'Tất Cả Truyện'}</h1>
                </div>

                <div className="search-tabs">
                    <button 
                        className={`search-tab-btn ${filters.mediaType === 'physical' ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, mediaType: 'physical' })}
                    >
                        Truyện In
                    </button>
                    <button 
                        className={`search-tab-btn ${filters.mediaType === 'digital' ? 'active' : ''}`}
                        onClick={() => setFilters({ ...filters, mediaType: 'digital' })}
                    >
                        Truyện Online
                    </button>
                </div>

                {currentItems.length > 0 ? (
                    <>
                        <p style={{marginBottom: '15px', color: 'var(--clr-text-secondary)'}}>
                            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredComics.length)} trên tổng số {filteredComics.length} truyện
                        </p>

                        <ProductList comics={currentItems} />
                        
                        <div style={{marginTop: '40px', display: 'flex', justifyContent: 'center'}}>
                            <Pagination 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <h2>Không tìm thấy kết quả nào</h2>
                        <p>Thử điều chỉnh bộ lọc hoặc chọn tab khác.</p>
                    </div>
                )}
            </div>

            <FilterSidebar 
          filters={filters}
          onFilterChange={setFilters}
          showPriceFilter={filters.mediaType === 'physical'} sortOption={''} onSortChange={function (_sort: string): void {
            throw new Error('Function not implemented.');
          } }            />
        </div>
    );
};

export default SearchPage;