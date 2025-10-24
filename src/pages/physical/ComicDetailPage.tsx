import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPlus, FiMinus, FiHeart } from 'react-icons/fi';
import { comics, type Comic } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import ReviewSection from '../../components/common/review/ReviewSection';
import { useNotification } from '../../contexts/NotificationContext';
import './ComicDetailPage.css';

// Component Skeleton
const ComicDetailSkeleton: React.FC = () => (
    <div className="detail-skeleton-wrapper">
        <div className="detail-image-wrapper">
            <div className="detail-skeleton-image skeleton-block"></div>
        </div>
        <div className="detail-info-wrapper">
            <div className="detail-skeleton-author skeleton-block"></div>
            <div className="detail-skeleton-title skeleton-block"></div>
            <div className="detail-skeleton-price skeleton-block"></div>
            
            <div className="detail-skeleton-actions">
                <div className="detail-skeleton-quantity skeleton-block"></div>
                <div className="detail-skeleton-cart-btn skeleton-block"></div>
                <div className="detail-skeleton-cart-btn skeleton-block" style={{ maxWidth: '180px' }}></div>
            </div>
            
            <div className="detail-description">
                <div className="detail-skeleton-description-title skeleton-block"></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '100%' }}></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '95%' }}></div>
                <div className="detail-skeleton-text-line skeleton-block" style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

// Hàm giả lập fetch data chi tiết
const fetchComicDetail = (id: number): Promise<Comic | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const comic = comics.find(c => c.id === id);
            resolve(comic);
        }, 800); // Giả lập độ trễ tải 800ms
    });
};


const ComicDetailPage: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { comicId } = useParams<{ comicId: string }>();
  const id = Number(comicId);

  const [comic, setComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const imgRef = useRef<HTMLImageElement>(null);

  // Fetch data khi component mount hoặc comicId thay đổi
  useEffect(() => {
      setIsLoading(true);
      fetchComicDetail(id)
        .then(data => {
            setComic(data || null);
        })
        .finally(() => {
            setIsLoading(false);
        });
  }, [id]);

  const isFavorite = comic ? isWishlisted(comic.id) : false;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    if (comic) {
      const rect = imgRef.current ? imgRef.current.getBoundingClientRect() : null;
      addToCart(comic, quantity, rect);
    }
  };

  const handleToggleWishlist = () => {
    if (comic) {
        toggleWishlist(comic);
        showNotification(isFavorite ? `Đã xóa ${comic.title} khỏi Yêu thích.` : `Đã thêm ${comic.title} vào Yêu thích.`, isFavorite ? 'error' : 'success');
    }
  };

  if (isLoading) {
      return (
        <div className="detail-page-container" style={{ padding: '3rem 0' }}>
            <ComicDetailSkeleton />
        </div>
      );
  }

  if (!comic) {
    return <div>Không tìm thấy truyện!</div>;
  }

  return (
    <div className="detail-page-container">
      <div className="detail-main-card">
        <div className="detail-image-wrapper">
          <img ref={imgRef} src={comic.imageUrl} alt={comic.title} className="detail-image" /> 
        </div>
        <div className="detail-info-wrapper">
          <p className="detail-author">Tác giả: {comic.author}</p>
          <h1 className="detail-title">{comic.title}</h1>
          <p className="detail-price">{formatPrice(comic.price)}</p>
          
          <div className="detail-actions">
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange(-1)} className="quantity-btn" aria-label="Giảm số lượng">
                <FiMinus />
              </button>
              <input type="text" value={quantity} readOnly className="quantity-input" />
              <button onClick={() => handleQuantityChange(1)} className="quantity-btn" aria-label="Tăng số lượng">
                <FiPlus />
              </button>
            </div>
            <button 
                className={`add-to-cart-btn wishlist-btn-detail ${isFavorite ? 'favorite' : ''}`} 
                onClick={handleToggleWishlist}
                aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            >
                <FiHeart style={{ marginRight: '0.5rem' }} /> 
                {isFavorite ? 'Đã yêu thích' : 'Thêm vào Yêu thích'}
            </button>
            <button className="add-to-cart-btn main-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
          </div>
          
          <div className="detail-description">
            <h3>Mô tả</h3>
            <p>
              Đây là mô tả cho cuốn truyện "{comic.title}". Nội dung chi tiết về các tình tiết hấp dẫn, 
              nhân vật đặc sắc và những cuộc phiêu lưu kỳ thú sẽ được cập nhật tại đây. 
              Hãy sẵn sàng để đắm chìm vào một thế giới đầy màu sắc và bất ngờ!
            </p>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <ReviewSection comicId={comic.id} comicTitle={comic.title} />
      </div>
    </div>
  );
};

export default ComicDetailPage;