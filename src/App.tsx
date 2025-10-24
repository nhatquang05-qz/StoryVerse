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