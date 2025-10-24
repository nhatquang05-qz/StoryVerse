// src/pages/Home.tsx
import React from 'react';
import ProductList from '../components/common/ProductList/ProductList';
import { comics } from '../data/mockData'; 

const HomePage: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '2rem', fontSize: 30, fontWeight: 'bold' }}>Truyện Mới Nhất</h1>
      <ProductList comics={comics} />
    </div>
  );
};

export default HomePage;