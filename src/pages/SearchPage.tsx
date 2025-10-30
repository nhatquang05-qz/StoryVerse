import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList/ProductList';
import { type ComicSummary } from '../types/comicTypes'; 
import LoadingPage from '../components/common/Loading/LoadingScreen'; 
import './category/CategoryPage.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const normalizedQuery = query.toLowerCase().trim();

  const [searchResults, setSearchResults] = useState<ComicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!normalizedQuery) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/comics/search?q=${encodeURIComponent(normalizedQuery)}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data: ComicSummary[] = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("Lỗi fetch search results:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [normalizedQuery]); 

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
    </div>
  );
};

export default SearchPage;