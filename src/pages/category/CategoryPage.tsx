import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../../components/common/ProductList/ProductList';
import { comics, getUniqueAuthors, physicalComics, digitalComics, type Comic } from '../../data/mockData';
import LoadingSkeleton from '../../components/common/LoadingSkeleton/LoadingSkeleton';
import Pagination from '../../components/common/Pagination';
import './CategoryPage.css';

interface CategoryData {
  title: string;
  description: string;
  sourceComics: Comic[];
}

// LƯU Ý: Hàm này chỉ chịu trách nhiệm chọn MẢNG NGUỒN (Source Array)
const fetchCategoryData = (slug: string): Promise<CategoryData> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let sourceComics: Comic[] = comics; // Mặc định là tất cả
      let title: string;
      let description: string;

      // Logic chọn mảng nguồn dữ liệu theo slug
      switch (slug) {
        case 'physical-comics':
          title = 'Truyện In - Sưu Tầm';
          description = 'Sở hữu những ấn phẩm giấy chất lượng cao nhất.';
          sourceComics = physicalComics; // Mảng CHỈ chứa truyện vật lý
          break;
        case 'digital-comics':
          title = 'Đọc Truyện Online';
          description = 'Thư viện truyện tranh số khổng lồ, đọc mọi lúc mọi nơi.';
          sourceComics = digitalComics; // Mảng CHỈ chứa truyện kỹ thuật số
          break;
        case 'new-releases':
          title = 'Mới Phát Hành';
          description = 'Cập nhật những tập truyện mới nhất vừa ra mắt.';
          sourceComics = comics.slice(0, 30);
          break;
        case 'action':
          title = 'Thể loại: Hành Động';
          description = 'Những trận chiến mãn nhãn và kịch tính.';
          sourceComics = physicalComics.filter(c => c.id % 2 === 0); // Lọc trên mảng vật lý
          break;
        case 'romance':
          title = 'Thể loại: Tình Cảm';
          description = 'Những câu chuyện tình yêu lãng mạn và cảm động.';
          sourceComics = digitalComics.filter(c => c.id % 2 !== 0); // Lọc trên mảng kỹ thuật số
          break;
        default:
          title = 'Danh Mục Truyện';
          description = 'Khám phá tất cả các bộ truyện hiện có.';
          sourceComics = comics;
          break;
      }
      resolve({ title, description, sourceComics });
    }, 800);
  });
};

const ITEMS_PER_PAGE = 25; 

const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  const [categoryTitle, setCategoryTitle] = useState('Đang tải...');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [allComics, setAllComics] = useState<Comic[]>([]);

  const [sortBy, setSortBy] = useState('newest');
  const [filterAuthor, setFilterAuthor] = useState('all');
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const uniqueAuthors = useMemo(() => getUniqueAuthors(), []);

  // Fetch data when slug changes
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    setFilterAuthor('all'); 
    setSortBy('newest'); 
    
    const slug = categorySlug || 'all'; 

    fetchCategoryData(slug)
      .then(data => {
        setCategoryTitle(data.title);
        setCategoryDescription(data.description);
        setAllComics(data.sourceComics);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [categorySlug]);
  
  // Filter and Sort Logic (Before Pagination)
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];

    // Lọc theo Tác giả
    if (filterAuthor !== 'all') {
        currentComics = currentComics.filter(comic => comic.author === filterAuthor);
    }

    // Sắp xếp
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
          return b.id - a.id;
      }
    });
    
    return currentComics;
  }, [allComics, filterAuthor, sortBy]);

  // Pagination Logic
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
  
  // Đảm bảo trang hiện tại hợp lệ
  useEffect(() => {
      if (currentPage > totalPages || currentPage < 1) {
          setCurrentPage(totalPages > 0 ? 1 : 1);
      }
  }, [currentPage, totalPages]);
  
  // Xử lý sự kiện thay đổi lọc/sắp xếp
  const handleFilterAuthorChange = (value: string) => {
      setFilterAuthor(value);
      setCurrentPage(1); 
  };

  const handleSortByChange = (value: string) => {
      setSortBy(value);
      setCurrentPage(1); 
  };


  return (
    <div className="category-page-container">
      <div className="category-header">
        <h1>{categoryTitle}</h1>
        <p>{categoryDescription}</p>
      </div>

      {isLoading ? (
          <div style={{ padding: '0 1.5rem' }}>
            <LoadingSkeleton count={ITEMS_PER_PAGE} />
          </div>
      ) : (
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

            {/* Content List */}
            {currentComics.length > 0 ? (
                <>
                    <ProductList comics={currentComics} />
                    {/* Chỉ hiển thị phân trang khi có nhiều hơn 1 trang */}
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
      )}
    </div>
  );
};

export default CategoryPage;