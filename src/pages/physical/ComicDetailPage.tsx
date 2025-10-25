import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiHeart, FiBookOpen } from 'react-icons/fi'; // Thêm FiBookOpen
import { comics, type Comic, loadOrders } from '../../data/mockData'; // Import loadOrders
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import ReviewSection from '../../components/common/review/ReviewSection';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Thêm useAuth
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

// LOGIC MỚI: Kiểm tra xem truyện digital đã được mua chưa
const isDigitalComicPurchased = (comicId: number, userId: string | undefined): boolean => {
    if (!userId) return false;
    
    const userOrders = loadOrders(userId);
    const validStatuses = ['Hoàn thành', 'Đang giao hàng']; // 'Hoàn thành' cho digital
    
    return userOrders
        .filter(order => validStatuses.includes(order.status))
        .flatMap(order => order.items)
        .some(item => item.id === comicId);
};


const ComicDetailPage: React.FC = () => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { showNotification } = useNotification();
  const { currentUser } = useAuth(); // Sử dụng useAuth
  const navigate = useNavigate(); // Sử dụng useNavigate
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
  
  // LOGIC MỚI: Kiểm tra trạng thái đã mua cho truyện digital
  const isPurchased = comic && comic.isDigital 
    ? isDigitalComicPurchased(comic.id, currentUser?.id) 
    : false;
    
  // Xử lý nút "Đọc Ngay"
  const handleReadNow = () => {
      if (comic) {
          navigate(`/read/${comic.id}`);
      }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };
  
  const handleAddToCart = () => {
    if (comic) {
      if(comic.isDigital && currentUser && isPurchased) {
          showNotification("Truyện này đã được mua. Vui lòng vào Thư viện số để đọc.", 'warning');
          return;
      }
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
  
  // HÀM MỚI: Hiển thị các nút hành động tùy theo loại truyện
  const renderActions = () => {
    // Nút Yêu thích chung cho cả hai loại
    const wishlistButton = (
        <button 
            className={`add-to-cart-btn wishlist-btn-detail ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            style={{ maxWidth: '180px', flexGrow: 0 }}
        >
            <FiHeart style={{ marginRight: '0.5rem' }} /> 
            {isFavorite ? 'Đã yêu thích' : 'Thêm vào Yêu thích'}
        </button>
    );
    
    if (comic!.isDigital) {
        if (currentUser && isPurchased) {
            // Truyện digital đã mua: Đọc ngay
            return (
                <div className="detail-actions">
                    <button className="add-to-cart-btn main-cart-btn" onClick={handleReadNow}>
                        <FiBookOpen style={{ marginRight: '0.5rem' }} /> Đọc Ngay
                    </button>
                    {wishlistButton}
                </div>
            );
        } else {
            // Truyện digital chưa mua: Mua truyện số
            return (
                <div className="detail-actions">
                    <button className="add-to-cart-btn main-cart-btn" onClick={handleAddToCart} 
                        style={{ maxWidth: '300px' }}>
                        Mua Truyện Số
                    </button>
                    {wishlistButton}
                </div>
            );
        }
    } 
    // Truyện vật lý: Thêm vào giỏ hàng (bao gồm bộ chọn số lượng)
    return (
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
            {wishlistButton}
            <button className="add-to-cart-btn main-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
        </div>
    );
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
          {/* LOGIC HIỂN THỊ DIGITAL BADGE TRÊN TRANG CHI TIẾT */}
          {comic.isDigital && (
              <span className="digital-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>DIGITAL</span>
          )}
        </div>
        <div className="detail-info-wrapper">
          <p className="detail-author">Tác giả: {comic.author}</p>
          <h1 className="detail-title">{comic.title}</h1>
          <p className="detail-price">{formatPrice(comic.price)}</p>
          
          {/* SỬ DỤNG HÀM RENDER MỚI */}
          {renderActions()}

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