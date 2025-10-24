// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import HomePage from './pages/HomePage';
import ComicDetailPage from '../src/pages/physical/ComicDetailPage';
import CartPage from './pages/CartPage';
import ScrollToTop from './components/common/ScrollToTop';
import FlyingImage from '../src/components/common/FlyingImage/FlyingImage';
import { useCart } from './contexts/CartContext';      
import './App.css';

// --- BẮT ĐẦU THAY ĐỔI ---
// 1. Import trang đăng nhập và đăng ký
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
// --- KẾT THÚC THAY ĐỔI ---

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
          
          {/* --- BẮT ĐẦU THAY ĐỔI --- */}
          {/* 2. Thêm Route cho trang đăng nhập và đăng ký */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* --- KẾT THÚC THAY ĐỔI --- */}

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