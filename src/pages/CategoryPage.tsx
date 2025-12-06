import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductList from '../components/common/ProductList';
import { type ComicSummary } from '../types/comicTypes';
import LoadingPage from '../components/common/Loading/LoadingScreen';
import Pagination from '../components/common/Pagination';
import FilterSidebar, { type SortState } from '../components/common/FilterSidebar';
import '../assets/styles/FilterSidebar.css';
import '../assets/styles/CategoryPage.css';

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

const CategoryPage: React.FC = () => {
	const { categorySlug } = useParams<{ categorySlug: string }>();

	const [categoryTitle, setCategoryTitle] = useState('Đang tải...');
	const [categoryDescription, setCategoryDescription] = useState('');
	const [allComics, setAllComics] = useState<ComicSummary[]>([]);

	const [sortState, setSortState] = useState<SortState>({
		time: null,
		alpha: null,
		value: null,
	});

	const [sortPriority, setSortPriority] = useState<(keyof SortState)[]>([
		'value',
		'time',
		'alpha',
	]);

	const [filters, setFilters] = useState<FilterState>({
		authors: [],
		genres: [],
		mediaType: 'digital',
		minPrice: undefined,
		maxPrice: undefined,
		ratingRange: [],
	});

	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		const fetchUrl = `${API_URL}/comics/by-genre?genre=${categorySlug}`;

		fetch(fetchUrl)
			.then(async (res) => {
				if (!res.ok) throw new Error(`API Error: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				const displayTitle = categorySlug
					? categorySlug.charAt(0).toUpperCase() +
						categorySlug.slice(1).replace(/-/g, ' ')
					: 'Thể loại';
				setCategoryTitle(displayTitle);
				setCategoryDescription(`Danh sách truyện thuộc thể loại ${displayTitle}`);

				const comicsRaw = Array.isArray(data) ? data : data.data || data.comics || [];

				const normalizedComics = comicsRaw.map((c: any) => ({
					...c,
					price: Number(c.price || 0),
					views: Number(c.viewCount || c.views || 0),
					averageRating: Number(c.averageRating || 0),
					isDigital: c.isDigital === 1 || c.isDigital === true || c.isDigital === 'true',
				}));
				setAllComics(normalizedComics);
			})
			.catch((err) => {
				console.error('Error fetching category:', err);
				setCategoryTitle('Không tìm thấy');
				setAllComics([]);
			})
			.finally(() => setIsLoading(false));
	}, [categorySlug]);

	const handleSortChange = (newSort: SortState, changedCategory?: keyof SortState | 'reset') => {
		setSortState(newSort);
		setCurrentPage(1);

		if (changedCategory === 'reset') {
			setSortPriority(['value', 'time', 'alpha']);
		} else if (changedCategory) {
			setSortPriority((prev) => {
				const newPriority = prev.filter((c) => c !== changedCategory);
				return [changedCategory, ...newPriority];
			});
		}
	};

	const currentComics = useMemo(() => {
		let result = [...allComics];

		if (filters.mediaType === 'digital') {
			result = result.filter((c) => c.isDigital);
		} else if (filters.mediaType === 'physical') {
			result = result.filter((c) => !c.isDigital);
		}

		if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
			const min = filters.minPrice !== undefined ? Number(filters.minPrice) : 0;
			const max = filters.maxPrice !== undefined ? Number(filters.maxPrice) : Infinity;
			result = result.filter((c) => {
				const price = Number(c.price);
				return price >= min && price <= max;
			});
		}

		if (filters.authors.length > 0) {
			result = result.filter((c) => c.author && filters.authors.includes(c.author));
		}

		if (filters.ratingRange.length > 0) {
			result = result.filter((c) => {
				const rating = c.averageRating || 0;
				return filters.ratingRange.some((range) => {
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
            if (typeof dateStr === 'object') return 0;

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
		<div className="category-page-layout">
			<div className="category-header">
				<div className="category-header-left">
					<h1>{categoryTitle}</h1>
					<p>{categoryDescription}</p>
				</div>

				<div className="category-tabs">
					<button
						className={`tab-btn ${filters.mediaType === 'digital' ? 'active' : ''}`}
						onClick={() => {
							setFilters({ ...filters, mediaType: 'digital' });
							setCurrentPage(1);
						}}
					>
						Truyện online
					</button>
					<button
						className={`tab-btn ${filters.mediaType === 'physical' ? 'active' : ''}`}
						onClick={() => {
							setFilters({ ...filters, mediaType: 'physical' });
							setCurrentPage(1);
						}}
					>
						Truyện giấy
					</button>
				</div>
			</div>

			<div className="category-container">
				<div className="main-content">
					{currentItems.length > 0 ? (
						<>
							<p style={{ marginBottom: '15px', color: 'var(--clr-text-secondary)' }}>
								Hiển thị {currentItems.length} trên tổng số {currentComics.length}{' '}
								truyện
							</p>
							<ProductList comics={currentItems} />
							{totalPages > 1 && (
								<div
									style={{
										marginTop: '40px',
										display: 'flex',
										justifyContent: 'center',
									}}
								>
									<Pagination
										currentPage={currentPage}
										totalPages={totalPages}
										onPageChange={handlePageChange}
									/>
								</div>
							)}
						</>
					) : (
						<div className="empty-state">
							<p>Không có sản phẩm nào phù hợp.</p>
						</div>
					)}
				</div>

				<div className="sidebar-wrapper">
					<FilterSidebar
						filters={filters}
						onFilterChange={(newFilters) => {
							setFilters(newFilters);
							setCurrentPage(1);
						}}
						showPriceFilter={filters.mediaType !== 'digital'}
						sortState={sortState}
						onSortChange={handleSortChange}
						hideGenreFilter={true}
					/>
				</div>
			</div>
		</div>
	);
};

export default CategoryPage;