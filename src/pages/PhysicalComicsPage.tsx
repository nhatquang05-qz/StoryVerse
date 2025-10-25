import React, { useMemo, useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import { getUniqueAuthors, physicalComics, type Comic, getUniqueGenres } from '../data/mockData';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import Pagination from '../components/common/Pagination';
import './category/CategoryPage.css';

const fetchPhysicalComics = (): Promise<Comic[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const sourceComics = physicalComics.filter(c => c.isDigital === false);
      resolve(sourceComics);
    }, 800);
  });
};

const ITEMS_PER_PAGE = 25; 

const PhysicalComicsPage: React.FC = () => {
  const [categoryTitle] = useState('Truyện In - Sưu Tầm');
  const [categoryDescription] = useState('Sở hữu những ấn phẩm giấy chất lượng cao nhất.');
  const [allComics, setAllComics] = useState<Comic[]>([]);

  const [sortBy, setSortBy] = useState('newest');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [filterGenre, setFilterGenre] = useState('all'); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const uniqueAuthors = useMemo(() => getUniqueAuthors(), []);
  const uniqueGenres = useMemo(() => getUniqueGenres(), []);


  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1); 
    setFilterAuthor('all'); 
    setSortBy('newest'); 
    setFilterGenre('all');
    
    fetchPhysicalComics()
      .then(data => {
        setAllComics(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  
  const processedComics = useMemo(() => {
    let currentComics = [...allComics];

    if (filterAuthor !== 'all') {
        currentComics = currentComics.filter(comic => comic.author === filterAuthor);
    }

    if (filterGenre !== 'all') {
        currentComics = currentComics.filter(comic => comic.genres.includes(filterGenre));
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
          return b.id - a.id;
      }
    });
    
    return currentComics;
  }, [allComics, filterAuthor, filterGenre, sortBy]);

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

  const handleFilterGenreChange = (value: string) => {
      setFilterGenre(value);
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
                    <span>Lọc theo Thể loại:</span>
                    <select value={filterGenre} onChange={(e) => handleFilterGenreChange(e.target.value)}>
                        <option value="all">Tất cả</option>
                        {uniqueGenres.map(genre => (
                            <option key={genre} value={genre}>{genre}</option>
                        ))}
                    </select>
                </div>

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
                    <ProductList comics={currentComics} />
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

export default PhysicalComicsPage;