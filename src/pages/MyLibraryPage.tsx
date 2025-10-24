import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { loadOrders, type OrderItem } from '../data/mockData';
import '../pages/profile/ProfilePage.css';
import './MyLibraryPage.css';

const MyLibraryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [purchasedComics, setPurchasedComics] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      setTimeout(() => {
        const userOrders = loadOrders(currentUser.id);
        
        const validStatuses = ['Hoàn thành', 'Đang giao hàng'];
        
        const validOrders = userOrders.filter(order => 
            validStatuses.includes(order.status)
        );

        const allItems = validOrders.flatMap(order => order.items);
        
        const uniqueComicsMap = new Map<number, OrderItem>();
        allItems.forEach(item => {
            if (!uniqueComicsMap.has(item.id)) {
                uniqueComicsMap.set(item.id, { ...item, quantity: 1 }); 
            }
        });

        const uniquePurchasedComics = Array.from(uniqueComicsMap.values());
        
        setPurchasedComics(uniquePurchasedComics);
        setIsLoading(false);
      }, 500); 
    }
  }, [currentUser]);

  const handleReadClick = (comicId: number) => {
    navigate(`/read/${comicId}`);
  };

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem Thư Viện Số.</h2>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/my-library" />
      <div className="profile-content">
        <h1>Thư Viện Truyện Kỹ Thuật Số</h1>
        <div className="profile-info-card" style={{ marginBottom: '2rem' }}>
            <p>
                Đây là nơi lưu trữ các cuốn truyện kỹ thuật số bạn đã mua thành công. 
                Bạn có thể đọc chúng bất cứ lúc nào! (Hiện tại chỉ hiển thị truyện đã mua, 
                chức năng "Đọc truyện" là giả lập).
            </p>
        </div>

        {isLoading ? (
            <p>Đang tải thư viện của bạn...</p>
        ) : purchasedComics.length > 0 ? (
          <div className="my-library-grid">
            {purchasedComics.map(comic => (
              <div key={comic.id} className="library-item">
                <Link to={`/comic/${comic.id}`}>
                  <img src={comic.imageUrl} alt={comic.title} className="library-item-image" />
                </Link>
                <div className="library-item-info">
                  <h3><Link to={`/comic/${comic.id}`}>{comic.title}</Link></h3>
                  <p>{comic.author}</p>
                  <button className="read-btn" onClick={() => handleReadClick(comic.id)}>Đọc Truyện</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FiBook className="library-empty-icon" />
            <p>Thư viện của bạn đang trống. Hãy mua truyện digital để bắt đầu đọc!</p>
            <Link to="/digital-comics" className="detail-order-btn">Mua truyện ngay</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibraryPage;