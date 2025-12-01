import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBolt, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/FlashSaleSection.css';

const API_BASE_URL = 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 12; // 6 cột * 2 hàng

const FlashSaleSection: React.FC = () => {
  const [activeSale, setActiveSale] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveSale();
    const interval = setInterval(fetchActiveSale, 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeSale) return;

    const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const target = new Date(
            new Date(activeSale.startTime) > new Date() ? activeSale.startTime : activeSale.endTime
        ).getTime();
        
        const difference = target - now;

        if (difference > 0) {
            setTimeLeft({
                hours: Math.floor((difference / (1000 * 60 * 60))),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            fetchActiveSale(); 
        }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [activeSale]);

  const fetchActiveSale = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/flash-sales/active`);
      setActiveSale(res.data);
    } catch (error) {
      console.log('No active flash sale');
      setActiveSale(null);
    }
  };

  if (!activeSale) return null;

  const isUpcoming = new Date(activeSale.startTime) > new Date();
  const totalItems = activeSale.items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  const handleNext = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrev = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentItems = activeSale.items.slice(
      currentPage * ITEMS_PER_PAGE, 
      (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    // Sử dụng class flash-sale-wrapper để giới hạn max-width 1100px
    <div className="flash-sale-wrapper">
        <div className="flash-sale-border">
            <div className="flash-sale-content">
                
                {/* Header */}
                <div className="flash-sale-header">
                    <div className="flash-sale-title">
                        <FaBolt className="flash-icon" />
                        <h2>
                            {isUpcoming ? 'SẮP DIỄN RA: ' : 'FLASH SALE'} {activeSale.name}
                        </h2>
                    </div>
                    
                    <div className="countdown-timer">
                        <span className="text-gray-400 text-xs font-semibold uppercase mr-1">
                            {isUpcoming ? 'Bắt đầu sau:' : 'Kết thúc trong:'}
                        </span>
                        <div className="flex gap-1 items-center">
                            <span className="timer-box">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="text-white font-bold text-xs">:</span>
                            <span className="timer-box">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="text-white font-bold text-xs">:</span>
                            <span className="timer-box seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {isUpcoming ? (
                    <div className="text-center py-8">
                        <FaClock className="text-4xl text-orange-500 mx-auto mb-3 animate-bounce"/>
                        <p className="text-gray-300 font-medium text-sm">Chương trình sẽ sớm bắt đầu.</p>
                    </div>
                ) : (
                    <>
                        {/* Nút Previous */}
                        {totalPages > 1 && (
                            <button onClick={handlePrev} className="nav-btn nav-prev" title="Trang trước">
                                <FaChevronLeft />
                            </button>
                        )}

                        {/* Grid Sản phẩm */}
                        <div className="flash-sale-grid">
                            {currentItems.map((item: any) => {
                                const percentSold = Math.min(100, Math.round((item.soldQuantity / item.quantityLimit) * 100));
                                const discountPercent = Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100);
                                const isSoldOut = item.soldQuantity >= item.quantityLimit;

                                return (
                                <div key={item.id} 
                                        onClick={() => navigate(`/comic/${item.comicId}`)}
                                        className={`flash-card ${isSoldOut ? 'opacity-60 grayscale' : ''}`}>
                                    
                                    <div className="discount-badge">
                                        -{discountPercent}%
                                    </div>

                                    <div className="card-image">
                                        <img src={item.coverImage} alt={item.title} loading="lazy" />
                                        {isSoldOut && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="text-white font-bold text-xs border border-white px-2 py-0.5 -rotate-12">HẾT HÀNG</span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="card-title" title={item.title}>{item.title}</h3>

                                    <div className="price-section">
                                        <span className="sale-price">{item.salePrice.toLocaleString()}đ</span>
                                        <span className="original-price">{item.originalPrice.toLocaleString()}đ</span>
                                    </div>

                                    <div className="quantity-section">
                                        <div className="progress-bar-container">
                                            <div className="progress-bar-fill" style={{ width: `${percentSold}%` }}></div>
                                            <div className="progress-text">
                                                {isSoldOut ? 'Hết hàng' : `Đã bán ${item.soldQuantity}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {/* Nút Next */}
                        {totalPages > 1 && (
                            <button onClick={handleNext} className="nav-btn nav-next" title="Xem thêm">
                                <FaChevronRight />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default FlashSaleSection;