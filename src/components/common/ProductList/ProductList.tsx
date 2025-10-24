import React from 'react';
import { type Comic } from '../../../data/mockData';
import ProductCard from '../ProductCard/ProductCards';
import './ProductList.css';

interface ProductListProps {
  comics: Comic[];
}

const ProductList: React.FC<ProductListProps> = ({ comics }) => {
  return (
    <div className="product-list">
      {comics.map(comic => (
        <ProductCard key={comic.id} comic={comic} />
      ))}
    </div>
  );
};

export default ProductList;
