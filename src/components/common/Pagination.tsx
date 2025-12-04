import React from 'react';
import '../../assets/styles/Pagination.css';

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
	const getPageNumbers = () => {
		const pages = [];
		const maxPagesToShow = 5;
		const halfMaxPages = Math.floor(maxPagesToShow / 2);

		let startPage = Math.max(1, currentPage - halfMaxPages);
		let endPage = Math.min(totalPages, currentPage + halfMaxPages);

		if (currentPage - halfMaxPages < 1) {
			endPage = Math.min(totalPages, maxPagesToShow);
		}

		if (currentPage + halfMaxPages > totalPages) {
			startPage = Math.max(1, totalPages - maxPagesToShow + 1);
		}

		// Thêm "..." ở đầu
		if (startPage > 1) {
			pages.push(1);
			if (startPage > 2) {
				pages.push('...');
			}
		}

		// Thêm các số trang
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		// Thêm "..." ở cuối
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				pages.push('...');
			}
			pages.push(totalPages);
		}

		return pages;
	};

	const pageNumbers = getPageNumbers();

	return (
		<div className="pagination-container">
			{/* Nút Trang trước (Previous) */}
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className="pagination-button arrow"
			>
				&lt; {/* Ký tự mũi tên trái */}
			</button>

			{/* Các nút số trang */}
			{pageNumbers.map((page, index) =>
				typeof page === 'number' ? (
					<button
						key={index}
						onClick={() => onPageChange(page)}
						className={`pagination-button number ${currentPage === page ? 'active' : ''}`}
					>
						{page}
					</button>
				) : (
					<span key={index} className="pagination-ellipsis">
						{page}
					</span>
				),
			)}

			{/* Nút Trang sau (Next) */}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className="pagination-button arrow"
			>
				&gt; {/* Ký tự mũi tên phải */}
			</button>
		</div>
	);
};

export default Pagination;
