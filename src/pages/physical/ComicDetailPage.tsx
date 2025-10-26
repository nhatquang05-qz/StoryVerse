import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiMinus, FiHeart, FiBookOpen } from 'react-icons/fi';
import { comics, type Comic, loadOrders, saveNewOrder } from '../../data/mockData';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishListContext';
import ReviewSection from '../../components/common/review/ReviewSection';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import './ComicDetailPage.css';

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
        }, 800);
    });
};

// Kiểm tra xem truyện digital đã được mua chưa
const isDigitalComicPurchased = (comicId: number, userId: string | undefined): boolean => {
    if (!userId) return false;
    
    const userOrders = loadOrders(userId);
    const validStatuses = ['Hoàn thành', 'Đang giao hàng'];
    
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
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { comicId } = useParams<{ comicId: string }>();
  const id = Number(comicId);

  const [comic, setComic] = useState<Comic | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const imgRef = useRef<HTMLImageElement>(null);

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
  
  const isPurchased = comic && comic.isDigital 
    ? isDigitalComicPurchased(comic.id, currentUser?.id) 
    : false;
    
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
    if (comic && !comic.isDigital) {
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
  
  // Logic giả lập mở khóa bằng Xu và ghi nhận vào lịch sử mua hàng
  const handleUnlockByCoin = () => {
      if (!currentUser) {
          showNotification('Vui lòng đăng nhập để mở khóa truyện.', 'warning');
          return;
      }
      
      if (!comic || !comic.isDigital) return;

      // Giả lập giao dịch thành công (trừ xu)
      showNotification(`Đã mở khóa "${comic.title}" với ${comic.unlockCoinPrice} Xu! Vui lòng vào Thư viện số.`, 'success');
      
      // Ghi nhận vào lịch sử mua hàng/thư viện số
      const newOrder = {
          id: `COIN-${Date.now()}`,
          userId: currentUser.id,
          date: new Date().toLocaleDateString('vi-VN'),
          total: 0, 
          status: 'Hoàn thành' as const, 
          items: [{ 
              id: comic.id,
              title: comic.title,
              author: comic.author,
              price: 0, 
              imageUrl: comic.imageUrl,
              quantity: 1,
          }],
      };
      saveNewOrder(newOrder);
      
      navigate(0); // Dùng navigate(0) để refresh trang (vì logic isPurchased dựa vào loadOrders từ localStorage)
  };
  
  const renderActions = () => {
    const wishlistButton = (
        <button 
            className={`add-to-cart-btn wishlist-btn-detail ${isFavorite ? 'favorite' : ''}`} 
            onClick={handleToggleWishlist}
            aria-label={isFavorite ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            style={{ flexGrow: 0 }}
        >
            <FiHeart style={{ marginRight: '0.5rem' }} /> 
            {isFavorite ? 'Đã yêu thích' : 'Thêm vào Yêu thích'}
        </button>
    );
    
    if (comic!.isDigital) {
        const isFullyFree = comic!.unlockCoinPrice === 0;

        if (currentUser && isPurchased) {
            // Đã mua/mở khóa: Đọc ngay + Yêu thích (2 nút cạnh nhau)
            return (
                <div className="detail-actions digital-actions-group" style={{ flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="add-to-cart-btn main-cart-btn" onClick={handleReadNow} style={{ maxWidth: '250px' }}>
                        <FiBookOpen style={{ marginRight: '0.5rem' }} /> Đọc Ngay
                    </button>
                    {wishlistButton}
                </div>
            );
        } else if (isFullyFree) {
            // Miễn phí: Đọc miễn phí (Toàn bộ) + Yêu thích (2 nút cạnh nhau)
            return (
                 <div className="detail-actions digital-actions-group" style={{ flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="add-to-cart-btn main-cart-btn" onClick={handleReadNow} style={{ backgroundColor: '#28a745', maxWidth: '250px' }}>
                        <FiBookOpen style={{ marginRight: '0.5rem' }} /> Đọc Miễn Phí
                    </button>
                    {wishlistButton}
                </div>
            );
        } else {
            // Trả phí bằng Xu: Đọc giới hạn + Mở khóa bằng Xu + Yêu thích (3 nút)
            return (
                <div className="digital-actions-group">
                    <p className="coin-warning-text" style={{ margin: '0', textAlign: 'center', color: 'var(--primary-color-dark)', fontWeight: 'bold' }}>Truyện có giới hạn chương đọc thử.</p>
                    
                    <div className="digital-main-buttons">
                        {/* Đọc Free (Giới hạn) */}
                        <button className="add-to-cart-btn" onClick={handleReadNow} style={{ backgroundColor: '#17a2b8' }}>
                            Đọc Free (Giới hạn)
                        </button>
                        
                        {/* Mở khóa bằng Xu */}
                        <button className="add-to-cart-btn" onClick={handleUnlockByCoin} style={{ background: '#ffc107', color: '#333', fontWeight: 'bold' }}>
                            <img src="/src/assets/images/coin.png" alt="Coin" style={{ width: '50px', height: '30px', marginRight: '0.5rem' }} />
                            Mở khóa ({comic!.unlockCoinPrice})
                        </button>
                    </div>
                    
                    {/* Nút Yêu thích nằm dưới, căn giữa */}
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
            <button className="add-to-cart-btn main-cart-btn" onClick={handleAddToCart}>Thêm vào giỏ hàng</button>
            {wishlistButton}
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
  
  const isDigital = comic.isDigital;

  return (
    <div className="detail-page-container">
      <div className="detail-main-card">
        <div className="detail-image-wrapper">
          <img ref={imgRef} src={comic.imageUrl} alt={comic.title} className="detail-image" /> 
          {/* LOGIC HIỂN THỊ DIGITAL BADGE TRÊN TRANG CHI TIẾT */}
          {isDigital && (
              <span className="digital-badge" style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>DIGITAL</span>
          )}
        </div>
        <div className="detail-info-wrapper">
          <p className="detail-author">Tác giả: {comic.author}</p>
          <h1 className="detail-title">{comic.title}</h1>
          
          {/* Ẩn giá nếu là truyện digital */}
          {!isDigital && <p className="detail-price">{formatPrice(comic.price)}</p>}
          
          {/* Hiển thị giá xu hoặc trạng thái free */}
          {isDigital && (
              <div className="digital-price-info" style={{ marginBottom: '2rem' }}>
                  {isPurchased ? (
                      <p className="detail-price" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#28a745', margin: 0, padding: 0, border: 'none' }}>
                          Đã mở khóa
                      </p>
                  ) : comic.unlockCoinPrice > 0 ? (
                      <p className="detail-price" style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-color-dark)', margin: 0, padding: 0, border: 'none' }}>
                           Mở khóa bằng: <span style={{ color: '#ffc107', fontWeight: 'bold' }}>{comic.unlockCoinPrice} Xu</span>
                      </p>
                  ) : (
                      <p className="detail-price" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#28a745', margin: 0, padding: 0, border: 'none' }}>
                          MIỄN PHÍ TRUY CẬP
                      </p>
                  )}
              </div>
          )}
          
          <div className="detail-actions" style={{ justifyContent: 'flex-start' }}>
            {renderActions()}
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