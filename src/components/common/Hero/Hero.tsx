// src/components/common/Hero.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Thế Giới Truyện Tranh Trong Tầm Tay</h1>
        <p className="hero-subtitle">
          Khám phá và sở hữu những bộ truyện tranh hot nhất từ Nhật Bản và khắp thế giới.
        </p>
        <Link to="/new-releases" className="hero-cta-button">
          Xem Ngay
        </Link>
      </div>
    </div>
  );
};

export default Hero;