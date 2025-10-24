import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList/ProductList';
import { comics } from '../data/mockData';
import './category/CategoryPage.css';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const normalizedQuery = query.toLowerCase().trim();

  const filteredComics = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }
    return comics.filter(comic => 
      comic.title.toLowerCase().includes(normalizedQuery) ||
      comic.author.toLowerCase().includes(normalizedQuery)
    );
  }, [normalizedQuery]);

  return (
    <div className="category-page-container">
      <div className="category-header">
        <h1>Kết Quả Tìm Kiếm</h1>
        <p>Hiển thị {filteredComics.length} kết quả cho từ khóa: "{query}"</p>
      </div>
      
      {filteredComics.length > 0 ? (
        <ProductList comics={filteredComics} />
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