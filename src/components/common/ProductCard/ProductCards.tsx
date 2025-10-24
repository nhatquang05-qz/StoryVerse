import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi'; 
import { type Comic } from '../../../data/mockData';
import { useCart } from '../../../contexts/CartContext';
import { useWishlist } from '../../../contexts/WishListContext'; 
import './ProductCard.css';

interface ProductCardProps {
  comic: Comic;
}

const ProductCard: React.FC<ProductCardProps> = ({ comic }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist(); 
  const imgRef = useRef<HTMLImageElement>(null);

  const isFavorite = isWishlisted(comic.id); 

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
    addToCart(comic, 1, rect);
  };
  
  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleWishlist(comic);
  };

  return (
    <div className="product-card">
      <Link to={`/comic/${comic.id}`} className="card-image-container">
        <img ref={imgRef} src={comic.imageUrl} alt={comic.title} className="card-image" />
        <div className="card-image-overlay">
          <button 
            className={`card-action-button wishlist-btn ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <FiHeart />
          </button>
          <button className="card-action-button" onClick={handleAddToCart} aria-label="Thêm vào giỏ hàng">
            <FiShoppingCart />
          </button>
        </div>
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