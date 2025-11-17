import React, { useMemo, useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import Pagination from '../components/common/Pagination';
import AdvancedFilterModal from '../components/popups/AdvancedFilterModal';
import '../assets/styles/CategoryPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const fetchDigitalComics = (): Promise<ComicSummary[]> => {
  return new Promise((resolve, reject) => {
    fetch(`${API_URL}/comics`)
        .then(res => {
            if (!res.ok) throw new Error('Không thể tải truyện');
            return res.json();
        })
        .then((allComics: ComicSummary[]) => {
            resolve(allComics.filter(c => (c.isDigital as any) === 1));
        })
        .catch(reject);
  });
};

const ITEMS_PER_PAGE = 25; 

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
}

const DigitalComicsPage: React.FC = () => {
  const [categoryTitle] = useState('Đọc Truyện Online');
  const [categoryDescription] = useState('Thư viện truyện tranh số khổng lồ, đọc mọi lúc mọi nơi.');
  const [allComics, setAllComics] = useState<ComicSummary[]>([]);

  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<FilterState>({ authors: [], genres: [], mediaType: 'digital' }); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [, setUniqueAuthors] = useState<string[]>([]);
  const [, setUniqueGenres] = useState<string[]>([]);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    setFilters({ authors: [], genres: [], mediaType: 'digital' }); 
    setSortBy('newest'); 
    
    fetchDigitalComics()
      .then(data => {
        setAllComics(data);
        
        const authors = Array.from(new Set(data.map(c => c.author).filter(Boolean) as string[]));
        const genres = Array.from(new Set(data.flatMap(c => c.genres ? c.genres.map(g => g.name) : []).filter(Boolean) as string[]));
        setUniqueAuthors(authors.sort());
        setUniqueGenres(genres.sort());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];

    // Lọc theo mediaType (chỉ hiển thị digital)
    currentComics = currentComics.filter(comic => (comic.isDigital as any) === 1);
    
    // Lọc theo Authors
    if (filters.authors.length > 0) {
        currentComics = currentComics.filter(comic => 
            comic.author && filters.authors.includes(comic.author)
        );
    }

    // Lọc theo Genres
    if (filters.genres.length > 0) {
        currentComics = currentComics.filter(comic => 
            comic.genres && comic.genres.some(g => filters.genres.includes(g.name))
        );
    }

    currentComics.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return Number(a.price) - Number(b.price);
        case 'price-desc':
          return Number(b.price) - Number(a.price);
        case 'title-asc':
          return a.title.localeCompare(b.title, 'vi');
        case 'title-desc':
          return b.title.localeCompare(a.title, 'vi');
        case 'newest':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    return currentComics;
  }, [allComics, filters, sortBy]);

  const totalItems = processedComics.length;
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  }, [totalItems]);
  
  const currentComics = useMemo(() => {
    const safeCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1); 
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    if (startIndex >= totalItems) {
        if (totalPages > 0) {
             const finalStartIndex = (totalPages - 1) * ITEMS_PER_PAGE;
             return processedComics.slice(finalStartIndex);
        }
        return [];
    }

    return processedComics.slice(startIndex, endIndex);
  }, [processedComics, currentPage, totalItems, totalPages]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); 
  };
  
  useEffect(() => {
      if (currentPage > totalPages || currentPage < 1) {
          setCurrentPage(totalPages > 0 ? 1 : 1);
      }
  }, [currentPage, totalPages]);
  
  const handleApplyAdvancedFilters = (newFilters: FilterState) => {
      setFilters(newFilters);
      setCurrentPage(1); 
  };

  const handleSortByChange = (value: string) => {
      setSortBy(value);
      setCurrentPage(1); 
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="category-page-container">
      <div className="category-header">
        <h1>{categoryTitle}</h1>
        <p>{categoryDescription}</p>
      </div>

      <>
        <div className="filter-sort-bar">
            <div className="filter-sort-group">
                <span>Bộ Lọc:</span>
                <button 
                    onClick={() => setIsFilterModalOpen(true)} 
                    className="detail-order-btn" 
                    style={{ padding: '0.5rem 1rem' }}
                >
                    Lọc Nâng Cao ({filters.authors.length + filters.genres.length})
                </button>
            </div>
            
            <div className="filter-sort-group">
                <span>Sắp xếp theo:</span>
                <select value={sortBy} onChange={(e) => handleSortByChange(e.target.value)}>
                    <option value="newest">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến Cao</option>
                    <option value="price-desc">Giá: Cao đến Thấp</option>
                    <option value="title-asc">Tên: A - Z</option>
                    <option value="title-desc">Tên: Z - A</option>
                </select>
            </div>
        </div>

        {currentComics.length > 0 ? (
            <>
                <ProductList comics={currentComics as any[]} /> 
                {totalPages > 1 && (
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </>
        ) : (
            <div className="empty-state">
                <p>Không có sản phẩm nào phù hợp với tiêu chí lọc.</p>
            </div>
        )}
      </>
       <AdvancedFilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyAdvancedFilters}
          initialFilters={filters}
       />
    </div>
  );
};

export default DigitalComicsPage;