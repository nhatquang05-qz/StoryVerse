// src/main.tsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 👈 1. Import BrowserRouter
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter> {/* 👈 2. Bọc App trong BrowserRouter */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)