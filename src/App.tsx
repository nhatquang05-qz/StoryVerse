import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AddressManagementPage from './pages/AddressManagementPage';
import MyLibraryPage from './pages/MyLibraryPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CategoryPage from './pages/CategoryPage';
import PhysicalComicsPage from './pages/PhysicalComicsPage';
import DigitalComicsPage from './pages/DigitalComicsPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/WishlistPage';
import ReaderPage from './pages/ReaderPage';
import CoinRechargePage from './pages/CoinRechargePage';
import SettingsPage from './pages/SettingPage';
import AdminPage from './pages/AdminPage';
import ScrollToTop from './components/common/ScrollToTop';
import FlyingImage from './components/common/FlyingImage';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import LevelUpPopup from './components/popups/LevelUpPopup';
import ChatbotUI from './components/chatbot/ChatbotUI';
import { useCart } from './contexts/CartContext';
import { useAuth } from './contexts/AuthContext';
import './assets/styles/App.css';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage'; 

function App() {
  const { animationData, clearAnimation } = useCart();
  const location = useLocation();
  const isReaderPage = location.pathname.startsWith('/read/');
  const { isLevelUpPopupOpen, levelUpInfo, closeLevelUpPopup } = useAuth();

  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
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
      {!isAdminPage && <Header />}
      <main className={isReaderPage ? "main-content reader-mode" : "main-content"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/comic/:comicId" element={<ComicDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} /> 
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> 
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
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}

      <FlyingImage
        src={animationData.src}
        startRect={animationData.startRect}
        endRect={animationData.endRect}
        onAnimationEnd={clearAnimation}
      />
      <ScrollToTopButton />

      {levelUpInfo && (
        <LevelUpPopup
          isOpen={isLevelUpPopupOpen}
          onClose={closeLevelUpPopup}
          newLevel={levelUpInfo.newLevel}
          levelTitle={levelUpInfo.levelTitle}
        />
      )}

      {!isAdminPage && <ChatbotUI />}
    </div>
  );
}

export default App;