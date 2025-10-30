import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../../components/common/ProductList/ProductList';
import { type ComicSummary } from '../../types/comicTypes';
import LoadingPage from '../../components/common/Loading/LoadingScreen';
import Pagination from '../../components/common/Pagination';
import './CategoryPage.css';

interface CategoryData {
  title: string;
  description: string;
  sourceComics: ComicSummary[];
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ITEMS_PER_PAGE = 25; 

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [categoryTitle, setCategoryTitle] = useState('Đang tải...');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [allComics, setAllComics] = useState<ComicSummary[]>([]);

  const [sortBy, setSortBy] = useState('newest');
  const [filterAuthor, setFilterAuthor] = useState('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueAuthors, setUniqueAuthors] = useState<string[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    setFilterAuthor('all'); 
    setSortBy('newest'); 
    
    const slug = categorySlug || 'all'; 

    fetch(`${API_URL}/comics`)
      .then(res => {
          if (!res.ok) throw new Error('Không thể tải truyện');
          return res.json();
      })
      .then((allApiComics: ComicSummary[]) => {
          let sourceComics: ComicSummary[] = allApiComics;
          let title: string;
          let description: string;
          
          switch (slug) {
            case 'new-releases':
              title = 'Mới Phát Hành';
              description = 'Cập nhật những tập truyện mới nhất vừa ra mắt.';
              sourceComics = allApiComics.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 30);
              break;
            case 'action':
              title = 'Thể loại: Hành Động';
              description = 'Những trận chiến mãn nhãn và kịch tính.';
              sourceComics = allApiComics.filter(c => c.genres && c.genres.toLowerCase().includes('hành động'));
              break;
            case 'romance':
              title = 'Thể loại: Tình Cảm';
              description = 'Những câu chuyện tình yêu lãng mạn và cảm động.';
              sourceComics = allApiComics.filter(c => c.genres && c.genres.toLowerCase().includes('tình cảm'));
              break;
            default:
              title = 'Danh Mục Truyện';
              description = 'Khám phá tất cả các bộ truyện hiện có.';
              sourceComics = allApiComics;
              break;
          }
          
          setCategoryTitle(title);
          setCategoryDescription(description);
          setAllComics(sourceComics);

          const authors = Array.from(new Set(sourceComics.map(c => c.author).filter(Boolean) as string[]));
          setUniqueAuthors(authors.sort());
      })
      .catch(err => {
            console.error("Lỗi tải category data:", err);
            setCategoryTitle("Lỗi");
            setCategoryDescription("Không thể tải dữ liệu cho danh mục này.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [categorySlug]);
  
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];

    if (filterAuthor !== 'all') {
        currentComics = currentComics.filter(comic => comic.author === filterAuthor);
    }

    currentComics.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
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
  }, [allComics, filterAuthor, sortBy]);

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
  
  const handleFilterAuthorChange = (value: string) => {
      setFilterAuthor(value);
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
                <span>Lọc theo Tác giả:</span>
                <select value={filterAuthor} onChange={(e) => handleFilterAuthorChange(e.target.value)}>
                    <option value="all">Tất cả</option>
                    {uniqueAuthors.map(author => (
                        <option key={author} value={author}>{author}</option>
                    ))}
                </select>
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
    </div>
  );
};

export default CategoryPage;