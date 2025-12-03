import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { type ComicSummary } from '../../types/comicTypes'; 
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import StarRating from './StarRating';
import '../../assets/styles/ProductCard.css';

import flashSaleBadgeIcon from '../../assets/images/fs.avif'; 

interface ProductCardProps {
  comic: ComicSummary; 
  isCarousel?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ comic, isCarousel = false }) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { currentUser, openLoginRequest } = useAuth(); 
  const imgRef = useRef<HTMLImageElement>(null);

  const comicData: any = comic;

  const isSaleStockAvailable = comicData.flashSaleLimit 
      ? (comicData.flashSaleSold || 0) < comicData.flashSaleLimit 
      : true;

  const hasFlashSale = 
      comicData.flashSalePrice && 
      comicData.flashSalePrice < comicData.price &&
      isSaleStockAvailable;
  
  const discountPercent = hasFlashSale 
    ? Math.round(((comicData.price - comicData.flashSalePrice) / comicData.price) * 100) 
    : 0;

  const isFavorite = isWishlisted(comicData.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };
  
  const formatCompactNumber = (count: number) => {
    const num = Number(count) || 0; 
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  const formatViewCount = (count: number) => {
    return formatCompactNumber(count) + ' lượt xem';
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser) {
        openLoginRequest();
        return;
    }
    const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
    addToCart(comicData, 1, rect); 
  };
  
  const handleToggleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser) {
        openLoginRequest();
        return;
    }
    toggleWishlist(comicData);
    showNotification(
        isFavorite ? `Đã xóa ${comicData.title} khỏi Yêu thích.` : `Đã thêm ${comicData.title} vào Yêu thích.`, 
        isFavorite ? 'error' : 'success'
    );
  };
  
  const displayRating = parseFloat(comicData.averageRating) || 0; 
  const totalReviews = parseInt(comicData.totalReviews) || 0;
  const soldCount = comicData.soldCount || 0; 

  return (
    <div className={`product-card ${isCarousel ? 'carousel-item' : ''}`}>
      
      {hasFlashSale && (
          <img src={flashSaleBadgeIcon} alt="Flash Sale" className="fs-badge-left" />
      )}

      {hasFlashSale && (
          <span className="fs-badge-right">-{discountPercent}%</span>
      )}

      <Link to={`/comic/${comicData.id}`} className="card-image-container">
        <img ref={imgRef} src={comicData.coverImageUrl} alt={comicData.title} className="card-image" /> 

        <div className="card-image-overlay">
          <button 
            className={`card-action-button wishlist-btn ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
          >
            <FiHeart />
          </button>
          
          {!comicData.isDigital && (
            <button className="card-action-button" onClick={handleAddToCart}>
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
             <span className="card-view-count" style={{ marginLeft: '0.5rem' }}>({totalReviews})</span>
          )}
        </div>
        
        {comicData.isDigital === 1 && (
          <div className="card-view-count-section">
            <span className="card-view-count">{formatViewCount(comicData.viewCount)}</span>
          </div>
        )}
        
        {!comicData.isDigital && (
            <div className="card-price-row">
                {hasFlashSale ? (
                    <div className="price-container-fs">
                        <span className="card-price fs-price">{formatPrice(comicData.flashSalePrice)}</span>
                        <span className="card-original-price">{formatPrice(comicData.price)}</span>
                    </div>
                ) : (
                    <span className="card-price">{formatPrice(comicData.price)}</span>
                )}
                
                <span className="card-sold-text">Đã bán {formatCompactNumber(soldCount)}</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;