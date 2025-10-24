import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProductList from '../components/common/ProductList/ProductList';
import ProfileSidebar from '../components/common/ProfileSideBar';
import { comics } from '../data/mockData'; 
import '../pages/profile/ProfilePage.css'; 

const MyLibraryPage: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="profile-page-not-logged">
        <h2>Bạn cần đăng nhập để xem thư viện số.</h2>
      </div>
    );
  }

  const ownedComics = comics.filter(comic => comic.id <= 3);

  return (
    <div className="profile-page-container">
      <ProfileSidebar activeLink="/my-library" />
      <div className="profile-content">
        <h1>Thư Viện Số Của Tôi</h1>
        
        {ownedComics.length > 0 ? (
          <ProductList comics={ownedComics} />
        ) : (
          <div className="empty-state">
            <p>Bạn chưa sở hữu bộ truyện tranh số nào.</p>
            <p>Hãy khám phá mục Đọc Online để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibraryPage;
