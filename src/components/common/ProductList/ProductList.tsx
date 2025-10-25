import React, { useMemo } from 'react';
import { type Comic } from '../../../data/mockData';
import ProductCard from '../ProductCard/ProductCards';
import './ProductList.css';

interface ProductListProps {
  comics: Comic[];
  pageIndex?: number; 
  itemsPerPage?: number;
}

const ProductList: React.FC<ProductListProps> = ({ comics, pageIndex = 0, itemsPerPage = 0 }) => {
  
  const virtualPages = useMemo(() => {
    if (itemsPerPage === 0) return [comics]; 

    const pages = [];
    for (let i = 0; i < comics.length; i += itemsPerPage) {
      pages.push(comics.slice(i, i + itemsPerPage));
    }
    return pages;
  }, [comics, itemsPerPage]);


  const transformStyle = useMemo(() => {
    if (itemsPerPage > 0) {
      return { 
        transform: `translateX(-${pageIndex * 100}%)`,
        width: `${virtualPages.length * 100}%` 
      };
    }
    return {};
  }, [pageIndex, itemsPerPage, virtualPages.length]);
  
  if (itemsPerPage === 0) {
      return (
          <div className="product-list">
              {comics.map(comic => (
                  <ProductCard key={comic.id} comic={comic} />
              ))}
          </div>
      );
  }


  return (
    <div className="product-list-carousel-wrapper">
      <div className="product-list-scroll-container" style={transformStyle}>
        {virtualPages.map((pageComics, pageIndex) => (
            <div key={pageIndex} className="product-list-page">
                {pageComics.map(comic => (
                    <ProductCard key={comic.id} comic={comic} isCarousel={true} /> 
                ))}
            </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;