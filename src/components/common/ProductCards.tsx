import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { type ComicSummary } from '../../types/comicTypes'; 
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import { useNotification } from '../../contexts/NotificationContext';
import StarRating from './StarRating';
import '../../assets/styles/ProductCard.css';

interface ProductCardProps {
  comic: ComicSummary; 
  isCarousel?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ comic, isCarousel = false }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const imgRef = useRef<HTMLImageElement>(null);

  const comicData: any = comic;

  const isFavorite = isWishlisted(comicData.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const formatViewCount = (count: number) => {
    const num = Number(count) || 0; 
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M lượt xem';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K lượt xem';
    }
    return num + ' lượt xem';
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
    addToCart(comicData, 1, rect); 
  };
  
  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    toggleWishlist(comicData);
    showNotification(
        isFavorite ? `Đã xóa ${comicData.title} khỏi Yêu thích.` : `Đã thêm ${comicData.title} vào Yêu thích.`, 
        isFavorite ? 'error' : 'success'
    );
  };
  
  const displayRating = parseFloat(comicData.averageRating) || 0; 
  const totalReviews = parseInt(comicData.totalReviews) || 0;

  return (
    <div 
        className={`product-card ${isCarousel ? 'carousel-item' : ''}`}
    >
      <Link to={`/comic/${comicData.id}`} className="card-image-container">
        <img ref={imgRef} src={comicData.coverImageUrl} alt={comicData.title} className="card-image" /> 

        <div className="card-image-overlay">
          <button 
            className={`card-action-button wishlist-btn ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
          >
            <FiHeart />
          </button>
          
          {!comicData.isDigital && (
            <button className="card-action-button" onClick={handleAddToCart} aria-label="Thêm vào giỏ hàng">
              <FiShoppingCart />
            </button>
          )}

        </div>
      </Link>
      <div className="card-info">
        <h3 className="card-title">
          <Link to={`/comic/${comicData.id}`}>{comicData.title}</Link>
        </h3>
        <p className="card-author">{comicData.author}</p>
        
        <div className="card-rating-section">
          <StarRating rating={displayRating} />
          {totalReviews > 0 && (
             <span className="card-view-count" style={{ marginLeft: '0.5rem' }}>({totalReviews} đánh giá)</span>
          )}
        </div>
        
        {comicData.isDigital === 1 && (
          <div className="card-view-count-section">
            <span className="card-view-count">{formatViewCount(comicData.viewCount)}</span>
          </div>
        )}
        
        {!comicData.isDigital && (
            <p className="card-price">{formatPrice(comicData.price)}</p>
        )}
        
      </div>
    </div>
  );
};

export default ProductCard;