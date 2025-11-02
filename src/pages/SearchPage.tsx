import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes'; 
import LoadingPage from '../components/common/Loading/LoadingScreen'; 
import AdvancedFilterModal from '../components/popups/AdvancedFilterModal';
import '../styles/CategoryPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const isAdvancedSearch = searchParams.get('advanced') === 'true';
  const normalizedQuery = query.toLowerCase().trim();

  const [searchResults, setSearchResults] = useState<ComicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ authors: [], genres: [], mediaType: 'all' });


  useEffect(() => {
    if (isAdvancedSearch) {
        setIsFilterModalOpen(true);
    }
  }, [isAdvancedSearch]);

  const fetchAndFilterResults = async (q: string, currentFilters: FilterState) => {
      if (!q && currentFilters.authors.length === 0 && currentFilters.genres.length === 0 && currentFilters.mediaType === 'all') {
          setSearchResults([]);
          setIsLoading(false);
          return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/comics/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const rawData: any[] = await response.json();
        
        const data: ComicSummary[] = rawData.map(comic => ({
            ...comic,
            id: Number(comic.id),
            isDigital: comic.isDigital === 1,
            price: Number(comic.price),
            views: Number(comic.viewCount),
            averageRating: Number(comic.averageRating) || 0,
            totalReviews: Number(comic.totalReviews) || 0,
        }));
        
        let filteredData = data;
        
        if (currentFilters.mediaType !== 'all') {
             const isDigitalFilter = currentFilters.mediaType === 'digital';
             filteredData = filteredData.filter(comic => comic.isDigital === isDigitalFilter);
        }
        
        if (currentFilters.authors.length > 0) {
             filteredData = filteredData.filter(comic => 
                 comic.author && currentFilters.authors.includes(comic.author)
             );
        }
        
        if (currentFilters.genres.length > 0) {
             filteredData = filteredData.filter(comic => 
                 comic.genres && comic.genres.some(g => currentFilters.genres.includes(g.name))
             );
        }

        setSearchResults(filteredData);
      } catch (error) {
        console.error("Lỗi fetch search results:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchAndFilterResults(normalizedQuery, filters);
  }, [normalizedQuery, filters]); 

  const handleApplyAdvancedFilters = (newFilters: FilterState) => {
      setFilters(newFilters);
      setIsFilterModalOpen(false);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="category-page-container">
      <div className="category-header">
        <h1>Kết Quả Tìm Kiếm</h1>
        {!isLoading && (
            <p>Hiển thị {searchResults.length} kết quả cho từ khóa: "{query}"</p>
        )}
      </div>
      
      {searchResults.length > 0 ? (
        <ProductList comics={searchResults as any[]} />
      ) : (
        <div className="empty-state">
          <h2>Không tìm thấy kết quả nào</h2>
          <p>Vui lòng thử lại với từ khóa khác hoặc kiểm tra chính tả.</p>
        </div>
      )}
      
       <AdvancedFilterModal 
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyAdvancedFilters}
          initialFilters={filters}
       />
    </div>
  );
};

export default SearchPage;