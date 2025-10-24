// src/components/ProductCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Comic } from '../../../src/data/mockData.ts';
import './ProductCard.css';

interface ProductCardProps {
  comic: Comic;
}

const ProductCard: React.FC<ProductCardProps> = ({ comic }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="product-card">
      <Link to={`/comic/${comic.id}`} className="card-image-link">
        <img src={comic.imageUrl} alt={comic.title} className="card-image" />
      </Link>
      <div className="card-info">
        <h3 className="card-title">
          <Link to={`/comic/${comic.id}`}>{comic.title}</Link>
        </h3>
        <p className="card-author">{comic.author}</p>
        <p className="card-price">{formatPrice(comic.price)}</p>
      </div>
    </div>
  );
};

export default ProductCard;