import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../../components/common/ProductList/ProductList';
import { comics } from '../../data/mockData';
import './CategoryPage.css';

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // Dữ liệu mock cho các trang danh mục chính
  const getCategoryData = (slug: string) => {
    switch (slug) {
      case 'physical-comics':
        return {
          title: 'Truyện In - Sưu Tầm',
          description: 'Sở hữu những ấn phẩm giấy chất lượng cao nhất.',
          // Giả lập hiển thị 6 cuốn đầu tiên
          filteredComics: comics.slice(0, 6),
        };
      case 'digital-comics':
        return {
          title: 'Đọc Truyện Online',
          description: 'Thư viện truyện tranh số khổng lồ, đọc mọi lúc mọi nơi.',
          // Giả lập hiển thị 4 cuốn cuối cùng
          filteredComics: comics.slice(4),
        };
      case 'new-releases':
        return {
          title: 'Mới Phát Hành',
          description: 'Cập nhật những tập truyện mới nhất vừa ra mắt.',
          // Giả lập hiển thị 4 cuốn đầu tiên
          filteredComics: comics.slice(0, 4),
        };
      case 'action':
        return {
          title: 'Thể loại: Hành Động',
          description: 'Những trận chiến mãn nhãn và kịch tính.',
          filteredComics: comics.filter(c => c.id % 2 === 0), // Lọc chẵn lẻ giả
        };
      default:
        return {
          title: 'Danh Mục Không Tồn Tại',
          description: '',
          filteredComics: [],
        };
    }
  };

  const categoryData = useMemo(() => getCategoryData(categorySlug || ''), [categorySlug]);

  return (
    <div className="category-page-container">
      <div className="category-header">
        <h1>{categoryData.title}</h1>
        <p>{categoryData.description}</p>
      </div>
      
      {categoryData.filteredComics.length > 0 ? (
        <ProductList comics={categoryData.filteredComics} />
      ) : (
        <div className="empty-state">
          <p>Không có sản phẩm nào trong danh mục này.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;