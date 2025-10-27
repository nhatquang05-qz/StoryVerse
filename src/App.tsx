// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/physical/ComicDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import AddressManagementPage from './pages/AddressManagementPage';
import MyLibraryPage from './pages/MyLibraryPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CategoryPage from './pages/category/CategoryPage';
import PhysicalComicsPage from './pages/PhysicalComicsPage';
import DigitalComicsPage from './pages/DigitalComicsPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import ReaderPage from './pages/ReaderPage';
import CoinRechargePage from './pages/CoinRechargePage';
import SettingsPage from './pages/SettingPage';
import ScrollToTop from './components/common/ScrollToTop';
import FlyingImage from './components/common/FlyingImage/FlyingImage';
import ScrollToTopButton from './components/common/ScrollToTopButton/ScrollToTopButton';
import { useCart } from './contexts/CartContext';
import './App.css';

// Import ChatLog component
import ChatLog from './components/common/Chat/ChatLog'; // Đường dẫn có thể cần điều chỉnh

function App() {
  const { animationData, clearAnimation } = useCart();

  useEffect(() => {
    // ... (code hiệu ứng click giữ nguyên)
    const handleGlobalClick = (event: MouseEvent) => {
      const targetElement = event.target as Element;
      const interactiveSelector = 'a, button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), .suggestion-item, .tag-card-link, .cursor-option';
      if (targetElement.closest(interactiveSelector)) {
        return;
      }

      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      document.body.appendChild(ripple);

      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;

      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    };

    document.addEventListener('click', handleGlobalClick);

    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);


  return (
    <div className="app-container">
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Routes>
          {/* ... (Các Route khác giữ nguyên) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/comic/:comicId" element={<ComicDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/addresses" element={<AddressManagementPage />} />
          <Route path="/my-library" element={<MyLibraryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/read/:comicId/:chapterNumber" element={<ReaderPage />} />
          <Route path="/recharge" element={<CoinRechargePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/physical-comics" element={<PhysicalComicsPage />} />
          <Route path="/digital-comics" element={<DigitalComicsPage />} />
          <Route path="/new-releases" element={<CategoryPage />} />
          <Route path="/genres/:categorySlug" element={<CategoryPage />} />
        </Routes>

        {/* Render ChatLog mà không cần truyền messages */}
        <ChatLog />

      </main>
      <Footer />

      <FlyingImage
        src={animationData.src}
        startRect={animationData.startRect}
        endRect={animationData.endRect}
        onAnimationEnd={clearAnimation}
      />
      <ScrollToTopButton />
    </div>
  );
}

export default App;