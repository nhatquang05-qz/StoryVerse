import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/physical/ComicDetailPage'; 
import CartPage from './pages/CartPage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage'; 
import MyLibraryPage from './pages/MyLibraryPage'; 
import OrdersPage from './pages/OrdersPage';     
import OrderDetailPage from './pages/OrderDetailPage';
import CategoryPage from './pages/category/CategoryPage';
import SearchPage from './pages/SearchPage';
import WishlistPage from './pages/wishlist/WishlistPage';
import ReaderPage from './pages/ReaderPage'; // Import mới
import ScrollToTop from './components/common/ScrollToTop';
import FlyingImage from './components/common/FlyingImage/FlyingImage'; 
import { useCart } from './contexts/CartContext';       
import './App.css';

function App() {
  const { animationData, clearAnimation } = useCart(); 

  return (
    <div className="app-container">
      <ScrollToTop />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/comic/:comicId" element={<ComicDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} /> 
          <Route path="/my-library" element={<MyLibraryPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrderDetailPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/read/:comicId" element={<ReaderPage />} /> {/* Route mới */}
          <Route path="/physical-comics" element={<CategoryPage />} />
          <Route path="/digital-comics" element={<CategoryPage />} />
          <Route path="/new-releases" element={<CategoryPage />} />
          <Route path="/genres/:categorySlug" element={<CategoryPage />} />
        </Routes>
      </main>
      <Footer />

      <FlyingImage 
        src={animationData.src}
        startRect={animationData.startRect}
        endRect={animationData.endRect}
        onAnimationEnd={clearAnimation} 
      />
    </div>
  );
}

export default App;