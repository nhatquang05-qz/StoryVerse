import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div className="pagination-controls">
            <button 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={isFirstPage}
            >
                <FiChevronLeft /> Trang trước
            </button>
            
            <span className="page-info-text">
                Trang {currentPage}/{totalPages}
            </span>

            <button 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={isLastPage}
            >
                Trang sau <FiChevronRight />
            </button>
        </div>
    );
};

export default Pagination;