// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Header from '../src/components/header/Header';
import Footer from '../src/components/footer/Footer'; 
import HomePage from '../src/pages/HomePage';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {/* THÊM KHỐI CODE NÀY VÀO */}
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
export default App;
