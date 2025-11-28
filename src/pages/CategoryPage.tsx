import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import Pagination from '../components/common/Pagination';
import FilterSidebar, { type SortState } from '../components/common/FilterSidebar';
import '../assets/styles/FilterSidebar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 20; 

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
    minPrice?: number;
    maxPrice?: number;
    ratingRange: string[];
}

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [categoryTitle, setCategoryTitle] = useState('Đang tải...');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [allComics, setAllComics] = useState<ComicSummary[]>([]);

  // MẶC ĐỊNH: Tick 3 dòng
  const [sortState, setSortState] = useState<SortState>({
      time: 'newest',
      alpha: 'title-asc',
      value: 'price-asc'
  });

  const [filters, setFilters] = useState<FilterState>({ 
      authors: [], 
      genres: [], 
      mediaType: 'all',
      minPrice: 0,
      maxPrice: 2000000,
      ratingRange: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCategoryComics = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/comics?limit=1000`); 
            if (!response.ok) throw new Error('Network response was not ok');
            const data: any = await response.json();
            const comicsArray = Array.isArray(data) ? data : (data.data || []);
            
            const mappedData = comicsArray.map((c: any) => ({
                ...c,
                views: Number(c.viewCount || c.views || 0),
                price: Number(c.price),
                averageRating: Number(c.averageRating || 0)
            }));

            const filteredByGenre = mappedData.filter((c: any) => 
                c.genres && c.genres.some((g: any) => 
                    g.name.toLowerCase() === categorySlug?.toLowerCase() || g.name === categorySlug
                )
            );

            setAllComics(filteredByGenre);
            setCategoryTitle(`Thể loại: ${categorySlug}`);
            setCategoryDescription(`Danh sách truyện thuộc thể loại ${categorySlug}`);
        } catch (error) {
            console.error("Lỗi tải truyện theo danh mục:", error);
            setCategoryTitle('Không tìm thấy danh mục');
        } finally {
            setIsLoading(false);
        }
    };

    if (categorySlug) {
        fetchCategoryComics();
        setFilters(prev => ({ ...prev, authors: [], genres: [], mediaType: 'all', ratingRange: [] })); 
        setSortState({ time: 'newest', alpha: 'title-asc', value: 'price-asc' });
        setCurrentPage(1);
    }
  }, [categorySlug]);
  
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];

    if (filters.mediaType === 'physical') {
        currentComics = currentComics.filter(c => (c.isDigital as any) === 0);
        if (filters.minPrice !== undefined) currentComics = currentComics.filter(c => c.price >= filters.minPrice!);
        if (filters.maxPrice !== undefined) currentComics = currentComics.filter(c => c.price <= filters.maxPrice!);
    } else if (filters.mediaType === 'digital') {
        currentComics = currentComics.filter(c => c.isDigital === true);
    }

    if (filters.authors.length > 0) {
        currentComics = currentComics.filter(comic => comic.author && filters.authors.includes(comic.author));
    }

    if (filters.genres.length > 0) {
        currentComics = currentComics.filter(comic => comic.genres && comic.genres.some(g => filters.genres.includes(g.name)));
    }

    if (filters.ratingRange.length > 0) {
        currentComics = currentComics.filter(c => {
            const rating = c.averageRating || 0;
            return filters.ratingRange.some(range => {
                const [min, max] = range.split('-').map(Number);
                return rating >= min && rating <= max;
            });
        });
    }

    currentComics.sort((a, b) => {
        let diffTime = 0;
        const dateA = new Date(a.updatedAt).setHours(0,0,0,0);
        const dateB = new Date(b.updatedAt).setHours(0,0,0,0);

        if (sortState.time === 'newest') diffTime = dateB - dateA;
        else if (sortState.time === 'oldest') diffTime = dateA - dateB;
        if (diffTime !== 0) return diffTime;

        let diffAlpha = 0;
        if (sortState.alpha === 'title-asc') diffAlpha = a.title.localeCompare(b.title, 'vi');
        else if (sortState.alpha === 'title-desc') diffAlpha = b.title.localeCompare(a.title, 'vi');
        if (diffAlpha !== 0) return diffAlpha;

        let diffValue = 0;
        if (sortState.value === 'price-asc') diffValue = Number(a.price) - Number(b.price);
        else if (sortState.value === 'price-desc') diffValue = Number(b.price) - Number(a.price);
        else if (sortState.value === 'views-desc') diffValue = (b.views || 0) - (a.views || 0);
        else if (sortState.value === 'views-asc') diffValue = (a.views || 0) - (b.views || 0);
        
        return diffValue;
    });
    
    return currentComics;
  }, [allComics, filters, sortState]);

  const totalItems = processedComics.length;
  const totalPages = useMemo(() => Math.ceil(totalItems / ITEMS_PER_PAGE), [totalItems]);
  
  const currentComics = useMemo(() => {
    const safeCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1); 
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return processedComics.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [processedComics, currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); 
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="search-page-layout">
        <div className="main-content">
            <div className="category-header">
                <h1>{categoryTitle}</h1>
                <p>{categoryDescription}</p>
            </div>

            <div className="search-tabs">
                <button className={`search-tab-btn ${filters.mediaType === 'all' ? 'active' : ''}`} onClick={() => setFilters({ ...filters, mediaType: 'all' })}>Tất cả</button>
                <button className={`search-tab-btn ${filters.mediaType === 'physical' ? 'active' : ''}`} onClick={() => setFilters({ ...filters, mediaType: 'physical' })}>Truyện In</button>
                <button className={`search-tab-btn ${filters.mediaType === 'digital' ? 'active' : ''}`} onClick={() => setFilters({ ...filters, mediaType: 'digital' })}>Online</button>
            </div>

            {currentComics.length > 0 ? (
                <>
                    <ProductList comics={currentComics as any[]} />
                    {totalPages > 1 && (
                        <div style={{marginTop: '40px', display: 'flex', justifyContent: 'center'}}>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state"><p>Không có sản phẩm nào phù hợp.</p></div>
            )}
        </div>

        <FilterSidebar 
            filters={filters}
            onFilterChange={(newFilters) => { setFilters(newFilters); setCurrentPage(1); }}
            showPriceFilter={filters.mediaType === 'physical'} 
            sortState={sortState}
            onSortChange={(newSort) => { setSortState(newSort); setCurrentPage(1); }}
        />
    </div>
  );
};

export default CategoryPage;