import React, { useMemo, useState, useEffect } from 'react';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import Pagination from '../components/common/Pagination';
import FilterSidebar, { type SortState } from '../components/common/FilterSidebar';
import '../assets/styles/FilterSidebar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ITEMS_PER_PAGE = 20;

interface FilterState {
    authors: string[];
    genres: string[];
    mediaType: 'all' | 'digital' | 'physical';
    minPrice?: number;
    maxPrice?: number;
    ratingRange: string[];
}

const PhysicalComicsPage: React.FC = () => {
  const [allComics, setAllComics] = useState<ComicSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryTitle] = useState('Truyện In');
  const [categoryDescription] = useState('Sở hữu những cuốn truyện tranh với chất lượng cao.');

  const [sortState, setSortState] = useState<SortState>({
      time: null,
      alpha: null,
      value: null
  });

  const [sortPriority, setSortPriority] = useState<(keyof SortState)[]>(['value', 'time', 'alpha']);

  const [filters, setFilters] = useState<FilterState>({
      authors: [],
      genres: [],
      mediaType: 'physical', 
      minPrice: undefined,
      maxPrice: undefined,
      ratingRange: []
  });

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/comics?limit=1000`)
        .then(res => res.json())
        .then((responseData: any) => {
            const comicsArray = Array.isArray(responseData) ? responseData : (responseData.data || []);
            const normalizedComics = comicsArray
                .filter((c: any) => c.isDigital === 0 || c.isDigital === false || c.isDigital === 'false')
                .map((c: any) => ({
                    ...c,
                    views: Number(c.viewCount || c.views || 0),
                    price: Number(c.price || 0),
                    averageRating: Number(c.averageRating || 0)
                }));
            setAllComics(normalizedComics);
        })
        .catch(err => console.error(err))
        .finally(() => setIsLoading(false));
  }, []);

  const handleSortChange = (newSort: SortState, changedCategory?: keyof SortState | 'reset') => {
    setSortState(newSort);
    setCurrentPage(1);
    if (changedCategory === 'reset') {
        setSortPriority(['value', 'time', 'alpha']);
    } else if (changedCategory) {
        setSortPriority(prev => [changedCategory, ...prev.filter(c => c !== changedCategory)]);
    }
  };

  const currentComics = useMemo(() => {
    let result = [...allComics];

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const min = filters.minPrice !== undefined ? Number(filters.minPrice) : 0;
        const max = filters.maxPrice !== undefined ? Number(filters.maxPrice) : Infinity;
        result = result.filter(c => {
            const price = Number(c.price);
            return price >= min && price <= max;
        });
    }

    if (filters.authors.length > 0) {
        result = result.filter(c => c.author && filters.authors.includes(c.author));
    }

    if (filters.genres.length > 0) {
        result = result.filter(c => {
            if (!c.genres) return false;
            const comicGenres = Array.isArray(c.genres)
                ? c.genres.map((g: any) => (typeof g === 'string' ? g : g.name).toLowerCase().trim())
                : (typeof c.genres === 'string' ? (c.genres as string).split(',') : []).map(s => s.toLowerCase().trim());
            return filters.genres.some(fg => comicGenres.includes(fg.toLowerCase().trim()));
        });
    }

    if (filters.ratingRange.length > 0) {
        result = result.filter(c => {
            const rating = c.averageRating || 0;
            return filters.ratingRange.some(range => {
                if (range === '4-5') return rating >= 4 && rating <= 5;
                if (range === '3-4') return rating >= 3 && rating < 4;
                if (range === '2-3') return rating >= 2 && rating < 3;
                if (range === '1-2') return rating >= 1 && rating < 2;
                return false;
            });
        });
    }

    const parseDate = (dateStr: any) => {
        if (!dateStr) return 0;
        if (dateStr instanceof Date) return dateStr.getTime();
        const s = String(dateStr);
        if (s.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
            const [d, m, y] = s.split('/');
            return new Date(Number(y), Number(m) - 1, Number(d)).getTime();
        }
        return new Date(s).getTime();
    };

    result.sort((a, b) => {
        for (const criteria of sortPriority) {
            let diff = 0;
            if (criteria === 'value' && sortState.value) {
                const pA = Number(a.price || 0);
                const pB = Number(b.price || 0);
                const vA = Number(a.views || 0);
                const vB = Number(b.views || 0);

                if (sortState.value === 'price-asc') diff = pA - pB;
                else if (sortState.value === 'price-desc') diff = pB - pA;
                else if (sortState.value === 'views-desc') diff = vB - vA;
                else if (sortState.value === 'views-asc') diff = vA - vB;
            }

            if (criteria === 'alpha' && sortState.alpha) {
                const tA = String(a.title || '');
                const tB = String(b.title || '');
                if (sortState.alpha === 'title-asc') diff = tA.localeCompare(tB, 'vi');
                else if (sortState.alpha === 'title-desc') diff = tB.localeCompare(tA, 'vi');
            }

            if (criteria === 'time' && sortState.time) {
                const timeA = parseDate(a.updatedAt || (a as any).createdAt);
                const timeB = parseDate(b.updatedAt || (b as any).createdAt);
                if (sortState.time === 'newest') diff = timeB - timeA;
                else if (sortState.time === 'oldest') diff = timeA - timeB;
            }

            if (diff !== 0) return diff;
        }
        return 0;
    });

    return result;
  }, [allComics, filters, sortState, sortPriority]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = currentComics.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentComics.length / ITEMS_PER_PAGE);

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

          {currentItems.length > 0 ? (
              <>
                  <p style={{marginBottom: '15px', color: 'var(--clr-text-secondary)'}}>
                      Hiển thị {currentItems.length} trên tổng số {currentComics.length} truyện
                  </p>
                  <ProductList comics={currentItems} />
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
          sortState={sortState}
          onSortChange={handleSortChange}
      />
    </div>
  );
};

export default PhysicalComicsPage;