import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBolt, FaClock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/FlashSaleSection.css';

const API_BASE_URL = 'http://localhost:3000/api';
const ITEMS_PER_PAGE = 7;

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
    <div className="fs-wrapper">
        <div className="fs-border">
            <div className="fs-content">
                
                <div className="fs-header">
                    <div className="fs-title-group">
                        <FaBolt className="fs-icon" />
                        <h2 className="fs-title-text">
                            {isUpcoming ? 'SẮP DIỄN RA: ' : 'FLASH SALE'} {activeSale.name}
                        </h2>
                    </div>
                    
                    <div className="fs-countdown">
                        <span className="fs-timer-label">
                            {isUpcoming ? 'Bắt đầu sau:' : 'Kết thúc trong:'}
                        </span>
                        <div className="fs-timer-digits">
                            <span className="fs-timer-box">{String(timeLeft.hours).padStart(2, '0')}</span>
                            <span className="fs-timer-sep">:</span>
                            <span className="fs-timer-box">{String(timeLeft.minutes).padStart(2, '0')}</span>
                            <span className="fs-timer-sep">:</span>
                            <span className="fs-timer-box fs-seconds">{String(timeLeft.seconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                {isUpcoming ? (
                    <div className="fs-empty-state">
                        <FaClock className="fs-empty-icon"/>
                        <p className="fs-empty-text">Chương trình sẽ sớm bắt đầu.</p>
                    </div>
                ) : (
                    <div className="fs-body">
                        {totalPages > 1 && (
                            <button onClick={handlePrev} className="fs-nav-btn fs-nav-prev" title="Trang trước">
                                <FaChevronLeft />
                            </button>
                        )}

                        <div className="fs-grid">
                            {currentItems.map((item: any) => {
                                const percentSold = Math.min(100, Math.round((item.soldQuantity / item.quantityLimit) * 100));
                                const discountPercent = Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100);
                                const isSoldOut = item.soldQuantity >= item.quantityLimit;

                                return (
                                <div key={item.id} 
                                    onClick={() => navigate(`/comic/${item.comicId}`)}
                                    className={`fs-card ${isSoldOut ? 'fs-sold-out' : ''}`}>
                                    
                                    <div className="fs-discount-badge">
                                        -{discountPercent}%
                                    </div>

                                    <div className="fs-card-img-container">
                                        <img src={item.coverImage} alt={item.title} loading="lazy" />
                                        {isSoldOut && (
                                            <div className="fs-sold-overlay">
                                                <span className="fs-sold-text">HẾT HÀNG</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="fs-card-info">
                                        <h3 className="fs-card-title" title={item.title}>{item.title}</h3>

                                        <div className="fs-price-row">
                                            <span className="fs-price-sale">{item.salePrice.toLocaleString()}đ</span>
                                            <span className="fs-price-original">{item.originalPrice.toLocaleString()}đ</span>
                                        </div>

                                        <div className="fs-qty-row">
                                            <div className="fs-prog-bg">
                                                <div className="fs-prog-fill" style={{ width: `${percentSold}%` }}></div>
                                                <div className="fs-prog-text">
                                                    {isSoldOut ? 'Hết hàng' : `Đã bán ${item.soldQuantity}`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <button onClick={handleNext} className="fs-nav-btn fs-nav-next" title="Xem thêm">
                                <FaChevronRight />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default FlashSaleSection;