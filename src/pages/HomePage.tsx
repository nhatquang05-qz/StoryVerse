// src/pages/Home.tsx
import React, { useState, useEffect, useMemo } from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import Hero from '../components/common/Hero/Hero';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import Pagination from '../components/common/Pagination'; 
import { comics, type Comic } from '../data/mockData'; 

// Hàm giả lập fetch data với độ trễ 1 giây
const fetchComics = (): Promise<Comic[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(comics);
        }, 1000); 
    });
};

const ITEMS_PER_PAGE = 30; // 30 cuốn mỗi trang

const HomePage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [allComics, setAllComics] = useState<Comic[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        fetchComics()
            .then(data => {
                setAllComics(data);
                if (currentPage > Math.ceil(data.length / ITEMS_PER_PAGE)) {
                    setCurrentPage(1);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);
    
    // Logic Pagination
    const totalPages = useMemo(() => {
        return Math.ceil(allComics.length / ITEMS_PER_PAGE);
    }, [allComics.length]);
    
    const currentComics = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return allComics.slice(startIndex, endIndex);
    }, [allComics, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0); 
    };

    return (
        <div>
            <Hero />
            <h1 style={{ marginBottom: '2rem', fontSize: 30, fontWeight: 'bold' }}>Truyện Mới Nhất</h1>
            
            {isLoading ? (
                <LoadingSkeleton count={ITEMS_PER_PAGE} />
            ) : (
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
            )}
        </div>
    );
};

export default HomePage;