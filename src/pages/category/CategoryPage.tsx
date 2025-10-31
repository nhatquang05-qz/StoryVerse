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
  
  const [activeTab, setActiveTab] = useState<'digital' | 'physical'>('digital');

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    setFilterAuthor('all'); 
    setSortBy('newest'); 
    setActiveTab('digital'); 
    
    const slug = categorySlug || 'all'; 
    let fetchUrl: string;
    let isGenreFetch = false;

    if (slug === 'new-releases') {
        fetchUrl = `${API_URL}/comics`; 
        setCategoryTitle('Mới Phát Hành');
        setCategoryDescription('Cập nhật những tập truyện mới nhất vừa ra mắt.');
    } else {
        fetchUrl = `${API_URL}/comics/by-genre?genre=${encodeURIComponent(slug)}`;
        setCategoryTitle(`Thể loại: ${slug}`);
        setCategoryDescription(`Khám phá các truyện thuộc thể loại ${slug}.`);
        isGenreFetch = true;
    }

    fetch(fetchUrl)
      .then(res => {
          if (!res.ok) throw new Error('Không thể tải truyện');
          return res.json();
      })
      .then((allApiComics: ComicSummary[]) => {
          let sourceComics: ComicSummary[] = allApiComics;
          
          if (slug === 'new-releases') {
              sourceComics = allApiComics
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 30);
          }
          
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
    
    if (activeTab === 'digital') {
        currentComics = currentComics.filter(comic => (comic.isDigital as any) === 1);
    } else { 
        currentComics = currentComics.filter(comic => (comic.isDigital as any) === 0);
    }

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
  }, [allComics, filterAuthor, sortBy, activeTab]); 

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
    if (currentPage > totalPages) {
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

  const handleTabChange = (tab: 'digital' | 'physical') => {
      setActiveTab(tab);
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

      <div className="category-tabs">
          <button
              className={`tab-button ${activeTab === 'digital' ? 'active' : ''}`}
              onClick={() => handleTabChange('digital')}
          >
              Truyện Online (Digital)
          </button>
          <button
              className={`tab-button ${activeTab === 'physical' ? 'active' : ''}`}
              onClick={() => handleTabChange('physical')}
          >
              Truyện In (Vật Lý)
          </button>
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