import React, { useState, useEffect } from 'react';
import { FiFilter, FiRotateCcw, FiStar } from 'react-icons/fi';
import '../../assets/styles/FilterSidebar.css';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FilterState {
	authors: string[];
	genres: string[];
	mediaType: 'all' | 'digital' | 'physical';
	minPrice?: number;
	maxPrice?: number;
	ratingRange: string[];
}

export interface SortState {
	time: 'newest' | 'oldest' | null;
	alpha: 'title-asc' | 'title-desc' | null;
	value: 'price-asc' | 'price-desc' | 'views-desc' | 'views-asc' | null;
}

interface FilterSidebarProps {
	filters: FilterState;
	onFilterChange: (newFilters: FilterState) => void;
	showPriceFilter: boolean;
	sortState: SortState;
	onSortChange: (newSortState: SortState, changedCategory?: keyof SortState | 'reset') => void;
	hideGenreFilter?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
	filters,
	onFilterChange,
	showPriceFilter,
	sortState,
	onSortChange,
	hideGenreFilter = false,
}) => {
	const [allGenres, setAllGenres] = useState<string[]>([]);
	const [allAuthors, setAllAuthors] = useState<string[]>([]);

	const MIN_GAP = 50000;
	const MAX_RANGE = 2000000;

	useEffect(() => {
		fetch(`${API_URL}/comics/system/genres`)
			.then((res) => res.json())
			.then((responseData: any) => {
				const genresData = Array.isArray(responseData)
					? responseData
					: responseData.data || [];
				if (Array.isArray(genresData)) {
					setAllGenres(genresData.map((g: any) => g.name).sort());
				} else {
					setAllGenres([]);
				}
			})
			.catch(() => setAllGenres([]));

		fetch(`${API_URL}/comics?limit=1000`)
			.then((res) => res.json())
			.then((rawData) => {
				let comicsArray: any[] = [];
				if (Array.isArray(rawData)) comicsArray = rawData;
				else if (rawData.data) comicsArray = rawData.data;
				else if (rawData.comics) comicsArray = rawData.comics;

				const uniqueAuthors = Array.from(
					new Set(
						comicsArray
							.map((comic: any) => comic.author)
							.filter(
								(author: any) => typeof author === 'string' && author.trim() !== '',
							),
					),
				).sort();

				setAllAuthors(uniqueAuthors as string[]);
			})
			.catch(() => setAllAuthors([]));
	}, []);

	const handleGenreToggle = (genre: string) => {
		const newGenres = filters.genres.includes(genre)
			? filters.genres.filter((g) => g !== genre)
			: [...filters.genres, genre];
		onFilterChange({ ...filters, genres: newGenres });
	};

	const handleAuthorToggle = (author: string) => {
		const newAuthors = filters.authors.includes(author)
			? filters.authors.filter((a) => a !== author)
			: [...filters.authors, author];
		onFilterChange({ ...filters, authors: newAuthors });
	};

	const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'min' | 'max') => {
		const value = parseInt(e.target.value);
		const minVal = filters.minPrice || 0;
		const maxVal = filters.maxPrice || MAX_RANGE;

		if (type === 'min') {
			if (value <= maxVal - MIN_GAP) onFilterChange({ ...filters, minPrice: value });
		} else {
			if (value >= minVal + MIN_GAP) onFilterChange({ ...filters, maxPrice: value });
		}
	};

	const handleRatingToggle = (range: string) => {
		const currentRatings = filters.ratingRange || [];
		const newRatings = currentRatings.includes(range)
			? currentRatings.filter((r) => r !== range)
			: [...currentRatings, range];

		onFilterChange({ ...filters, ratingRange: newRatings });
	};

	const handleSortToggle = (category: keyof SortState, value: string) => {
		if (sortState[category] === value) {
			onSortChange({ ...sortState, [category]: null }, category);
		} else {
			onSortChange({ ...sortState, [category]: value as any }, category);
		}
	};

	const minPercent = ((filters.minPrice || 0) / MAX_RANGE) * 100;
	const maxPercent = ((filters.maxPrice || MAX_RANGE) / MAX_RANGE) * 100;

	const handleReset = () => {
		onFilterChange({
			authors: [],
			genres: [],
			mediaType: filters.mediaType,
			minPrice: 0,
			maxPrice: MAX_RANGE,
			ratingRange: [],
		});
		onSortChange(
			{
				time: null,
				alpha: null,
				value: null,
			},
			'reset',
		);
	};

	const formatPrice = (price?: number) => {
		return price ? price.toLocaleString('vi-VN') + 'đ' : '0đ';
	};

	const isDigital = filters.mediaType === 'digital';

	return (
		<aside className="filter-sidebar">
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: '20px',
					borderBottom: '1px solid var(--clr-border-light)',
					paddingBottom: '15px',
				}}
			>
				<h2
					style={{
						fontSize: '1.2rem',
						margin: 0,
						display: 'flex',
						alignItems: 'center',
						gap: '8px',
					}}
				>
					<FiFilter /> Bộ lọc
				</h2>
				<button
					onClick={handleReset}
					style={{
						background: 'none',
						border: 'none',
						color: 'var(--clr-primary)',
						cursor: 'pointer',
						display: 'flex',
						alignItems: 'center',
						gap: '5px',
						fontSize: '0.9rem',
					}}
				>
					<FiRotateCcw /> Đặt lại
				</button>
			</div>

			<div className="sidebar-section">
				<h3>Sắp xếp theo</h3>

				<div
					style={{
						marginBottom: '10px',
						fontSize: '0.9rem',
						fontWeight: 600,
						color: 'var(--clr-text-secondary)',
					}}
				>
					Thời gian
				</div>
				<div className="sort-grid" style={{ marginBottom: '15px' }}>
					<label className="sort-item">
						<input
							type="radio"
							checked={sortState.time === 'newest'}
							onClick={() => handleSortToggle('time', 'newest')}
							readOnly
						/>
						Mới nhất
					</label>
					<label className="sort-item">
						<input
							type="radio"
							checked={sortState.time === 'oldest'}
							onClick={() => handleSortToggle('time', 'oldest')}
							readOnly
						/>
						Cũ nhất
					</label>
				</div>

				<div
					style={{
						marginBottom: '10px',
						fontSize: '0.9rem',
						fontWeight: 600,
						color: 'var(--clr-text-secondary)',
					}}
				>
					Tên truyện
				</div>
				<div className="sort-grid" style={{ marginBottom: '15px' }}>
					<label className="sort-item">
						<input
							type="radio"
							checked={sortState.alpha === 'title-asc'}
							onClick={() => handleSortToggle('alpha', 'title-asc')}
							readOnly
						/>
						Tên: A - Z
					</label>
					<label className="sort-item">
						<input
							type="radio"
							checked={sortState.alpha === 'title-desc'}
							onClick={() => handleSortToggle('alpha', 'title-desc')}
							readOnly
						/>
						Tên: Z - A
					</label>
				</div>

				{(showPriceFilter || isDigital) && (
					<>
						<div
							style={{
								marginBottom: '10px',
								fontSize: '0.9rem',
								fontWeight: 600,
								color: 'var(--clr-text-secondary)',
							}}
						>
							{showPriceFilter ? 'Giá bán' : 'Lượt xem'}
						</div>
						<div className="sort-grid">
							{showPriceFilter ? (
								<>
									<label className="sort-item">
										<input
											type="radio"
											checked={sortState.value === 'price-asc'}
											onClick={() => handleSortToggle('value', 'price-asc')}
											readOnly
										/>
										Thấp - Cao
									</label>
									<label className="sort-item">
										<input
											type="radio"
											checked={sortState.value === 'price-desc'}
											onClick={() => handleSortToggle('value', 'price-desc')}
											readOnly
										/>
										Cao - Thấp
									</label>
								</>
							) : (
								<>
									<label className="sort-item">
										<input
											type="radio"
											checked={sortState.value === 'views-desc'}
											onClick={() => handleSortToggle('value', 'views-desc')}
											readOnly
										/>
										Cao nhất
									</label>
									<label className="sort-item">
										<input
											type="radio"
											checked={sortState.value === 'views-asc'}
											onClick={() => handleSortToggle('value', 'views-asc')}
											readOnly
										/>
										Thấp nhất
									</label>
								</>
							)}
						</div>
					</>
				)}
			</div>

			<div className="sidebar-section">
				<h3>Đánh giá</h3>
				<div className="rating-grid">
					<label className="sort-item">
						<input
							type="checkbox"
							checked={filters.ratingRange.includes('4-5')}
							onChange={() => handleRatingToggle('4-5')}
						/>
						<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
							4-5 <FiStar fill="#FFC107" color="#FFC107" size={12} />
						</span>
					</label>
					<label className="sort-item">
						<input
							type="checkbox"
							checked={filters.ratingRange.includes('3-4')}
							onChange={() => handleRatingToggle('3-4')}
						/>
						<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
							3-4 <FiStar fill="#FFC107" color="#FFC107" size={12} />
						</span>
					</label>
					<label className="sort-item">
						<input
							type="checkbox"
							checked={filters.ratingRange.includes('2-3')}
							onChange={() => handleRatingToggle('2-3')}
						/>
						<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
							2-3 <FiStar fill="#FFC107" color="#FFC107" size={12} />
						</span>
					</label>
					<label className="sort-item">
						<input
							type="checkbox"
							checked={filters.ratingRange.includes('1-2')}
							onChange={() => handleRatingToggle('1-2')}
						/>
						<span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
							1-2 <FiStar fill="#FFC107" color="#FFC107" size={12} />
						</span>
					</label>
				</div>
			</div>

			{showPriceFilter && (
				<div className="sidebar-section">
					<h3>Khoảng giá</h3>
					<div className="price-slider-wrapper">
						<div className="price-slider-container">
							<div className="slider-track"></div>
							<div
								className="slider-range"
								style={{
									left: `${minPercent}%`,
									width: `${maxPercent - minPercent}%`,
								}}
							></div>
							<input
								type="range"
								min="0"
								max={MAX_RANGE}
								step="50000"
								value={filters.minPrice || 0}
								onChange={(e) => handleRangeChange(e, 'min')}
								className="range-input"
							/>
							<input
								type="range"
								min="0"
								max={MAX_RANGE}
								step="50000"
								value={filters.maxPrice || MAX_RANGE}
								onChange={(e) => handleRangeChange(e, 'max')}
								className="range-input"
							/>
						</div>
						<div className="price-values">
							<span>{formatPrice(filters.minPrice || 0)}</span>
							<span>{formatPrice(filters.maxPrice || MAX_RANGE)}</span>
						</div>
					</div>
				</div>
			)}

			{!hideGenreFilter && (
				<div className="sidebar-section">
					<h3>Thể loại</h3>
					<div className="checkbox-list">
						{allGenres.length > 0 ? (
							allGenres.map((genre) => (
								<label key={genre} className="checkbox-item">
									<input
										type="checkbox"
										checked={filters.genres.includes(genre)}
										onChange={() => handleGenreToggle(genre)}
									/>
									{genre}
								</label>
							))
						) : (
							<p style={{ color: '#999', fontSize: '0.9rem', padding: '5px 0' }}>
								Đang tải thể loại...
							</p>
						)}
					</div>
				</div>
			)}

			<div className="sidebar-section">
				<h3>Tác giả</h3>
				<div className="checkbox-list">
					{allAuthors.map((author) => (
						<label key={author} className="checkbox-item">
							<input
								type="checkbox"
								checked={filters.authors.includes(author)}
								onChange={() => handleAuthorToggle(author)}
							/>
							{author}
						</label>
					))}
				</div>
			</div>
		</aside>
	);
};

export default FilterSidebar;
