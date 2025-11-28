import React, { useMemo, useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import Pagination from '../components/common/Pagination';
import FilterSidebar from '../components/common/FilterSidebar';
import '../assets/styles/FilterSidebar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const fetchPhysicalComics = (): Promise<ComicSummary[]> => {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/comics?limit=1000`)
        .then(res => {
            if (!res.ok) throw new Error('Không thể tải truyện');
            return res.json();
        })
        .then((responseData: any) => {
            const comicsArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
            resolve(comicsArray.filter((c: any) => (c.isDigital as any) === 0));
        })
        .catch(reject);
  });
};

const ITEMS_PER_PAGE = 20; 

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
    minPrice?: number;
    maxPrice?: number;
}

const PhysicalComicsPage: React.FC = () => {
  const [categoryTitle] = useState('Truyện In - Sưu Tầm');
  const [categoryDescription] = useState('Sở hữu những ấn phẩm giấy chất lượng cao nhất.');
  const [allComics, setAllComics] = useState<ComicSummary[]>([]);

  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<FilterState>({ 
      authors: [], 
      genres: [], 
      mediaType: 'physical',
      minPrice: 0,
      maxPrice: 2000000 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    fetchPhysicalComics().then(setAllComics).finally(() => setIsLoading(false));
  }, []);
  
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];
    
    if (filters.minPrice !== undefined) currentComics = currentComics.filter(c => c.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) currentComics = currentComics.filter(c => c.price <= filters.maxPrice!);

    if (filters.authors.length > 0) {
        currentComics = currentComics.filter(comic => comic.author && filters.authors.includes(comic.author));
    }

    if (filters.genres.length > 0) {
        currentComics = currentComics.filter(comic => comic.genres && comic.genres.some(g => filters.genres.includes(g.name)));
    }

    currentComics.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return Number(a.price) - Number(b.price);
        case 'price-desc': return Number(b.price) - Number(a.price);
        case 'title-asc': return a.title.localeCompare(b.title, 'vi');
        case 'title-desc': return b.title.localeCompare(a.title, 'vi');
        case 'oldest': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(); 
        case 'newest':
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    return currentComics;
  }, [allComics, filters, sortBy]);

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

          {currentComics.length > 0 ? (
              <>
                  <p style={{marginBottom: '15px', color: 'var(--clr-text-secondary)'}}>
                      Hiển thị {currentComics.length} trên tổng số {totalItems} truyện
                  </p>
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
          showPriceFilter={true}
          sortOption={sortBy}
          onSortChange={(sort) => { setSortBy(sort); setCurrentPage(1); }}
      />
    </div>
  );
};

export default PhysicalComicsPage;