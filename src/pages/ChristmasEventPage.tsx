import React, { useState, useEffect } from 'react';
import '../assets/styles/ChristmasMinigame.css';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import treeImg from '../assets/images/minigameChristmas/christmas_tree.png';
import decor1 from '../assets/images/minigameChristmas/decor1.png';
import decor2 from '../assets/images/minigameChristmas/decor2.png';
import decor3 from '../assets/images/minigameChristmas/decor3.png';
import decor4 from '../assets/images/minigameChristmas/decor4.png';
import decor5 from '../assets/images/minigameChristmas/decor5.png';
import decor6 from '../assets/images/minigameChristmas/decor6.png';
import flake1 from '../assets/images/minigameChristmas/flake.png'; 

const DECOR_IMAGES = [decor1, decor2, decor3, decor4, decor5, decor6];
const FLAKE_IMAGES = [flake1];
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png"; 
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const PRIZES_CONFIG = [
  { label: '10 Xu', deg: 30 },
  { label: '50 Xu', deg: 90 },
  { label: 'May mắn', deg: 150 },
  { label: '100 Xu', deg: 210 },
  { label: 'Voucher', deg: 270 },
  { label: 'Truyện In', deg: 330 }
];

interface DisplayWish {
  _id: string | number;
  user: { fullName: string; avatarUrl: string; };
  content: string;
  top: number; 
  left: number;
  decorIndex: number;
  animationDelay: number;
}

const ChristmasEventPage: React.FC = () => {
  const { currentUser, token, fetchUser } = useAuth();
  const navigate = useNavigate();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [showWheelModal, setShowWheelModal] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');

  const [displayWishes, setDisplayWishes] = useState<DisplayWish[]>([]);
  const [wishInput, setWishInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getRandomTreePosition = () => {
    const top = Math.floor(Math.random() * 65) + 15; 
    const maxSpread = 40 - ((40 - 10) * (80 - top) / (80 - 15)); 
    const left = Math.floor(Math.random() * (maxSpread * 2)) + (50 - maxSpread);
    return { top, left };
  };

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const res = await axios.get(`${API_URL}/minigame/wishes`);
        const mapped: DisplayWish[] = res.data.map((w: any) => ({
            _id: w.id || w._id, 
            content: w.content,
            user: { 
                fullName: w.fullName || w.username || 'Ẩn danh', 
                avatarUrl: w.avatarUrl || w.avatar || DEFAULT_AVATAR
            },
            top: getRandomTreePosition().top,
            left: getRandomTreePosition().left,
            decorIndex: Math.floor(Math.random() * DECOR_IMAGES.length),
            animationDelay: Math.random() * 2
        }));
        setDisplayWishes(mapped);
      } catch (error) { console.error(error); }
    };
    fetchWishes();
  }, []);

  const handleSpin = async () => {
    if (!currentUser || !token) return toast.error("Đăng nhập để quay!");
    if ((currentUser.coinBalance || 0) < 20) return toast.error("Bạn cần 20 Xu!");
    if (isSpinning) return;

    setIsSpinning(true);
    setRewardMessage('');

    try {
      const response = await axios.post(`${API_URL}/minigame/spin`, {}, { headers: { Authorization: `Bearer ${token}` }});
      const { result } = response.data;
      const targetPrize = PRIZES_CONFIG.find(p => p.label === result.label) || PRIZES_CONFIG[0];
      const spinAngle = wheelDeg + 1800 + (360 - targetPrize.deg); 
      setWheelDeg(spinAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setRewardMessage(`🎉 Bạn nhận được: ${result.label}`);
        toast.success(`Chúc mừng! Bạn trúng ${result.label}`);
        fetchUser();
      }, 4000);
    } catch (error: any) {
      setIsSpinning(false);
      toast.error(error.response?.data?.message || "Lỗi quay thưởng");
    }
  };

  const handleSendWish = async () => {
    if (!currentUser || !token) return toast.error("Vui lòng đăng nhập!");
    if (!wishInput.trim()) return;

    setIsSending(true);
    try {
      const res = await axios.post(`${API_URL}/minigame/wish`, { content: wishInput }, { headers: { Authorization: `Bearer ${token}` }});
      const { top, left } = getRandomTreePosition();
      const newWish: DisplayWish = {
        _id: Date.now(),
        user: { fullName: currentUser.fullName || 'Bạn', avatarUrl: currentUser.avatarUrl || DEFAULT_AVATAR },
        content: wishInput,
        top, left,
        decorIndex: Math.floor(Math.random() * DECOR_IMAGES.length),
        animationDelay: 0
      };
      setDisplayWishes(prev => [newWish, ...prev]);
      setWishInput('');
      toast.success(res.data.message);
      fetchUser();
    } catch (error: any) { toast.error("Lỗi gửi lời chúc"); } finally { setIsSending(false); }
  };

  return (
    <div className="xmas-container">
      <button className="back-home-btn" onClick={() => navigate('/')}>
        ⬅ Trang chủ
      </button>

      <div className="snowfall-zone">
        <SnowfallManager />
      </div>

      <div className="flying-wishes-zone">
        <FlyingWishesManager wishes={displayWishes} />
      </div>

      <div className="tree-display-area">
        <img src={treeImg} alt="Christmas Tree" className="main-tree-img" />
        {displayWishes.map((w) => (
          <div 
            key={w._id}
            className="tree-decor"
            style={{
              top: `${w.top}%`, left: `${w.left}%`, animationDelay: `${w.animationDelay}s`
            }}
          >
            <img src={DECOR_IMAGES[w.decorIndex]} alt="decor" style={{width: '100%', height: '100%'}} />
            <div className="decor-tooltip">
              <span className="decor-user">{w.user.fullName}</span> "{w.content}"
            </div>
          </div>
        ))}
      </div>

      <div className="wish-input-bar">
        <input 
          type="text" 
          className="wish-input-field"
          placeholder="Nhập lời chúc Giáng sinh..." 
          value={wishInput}
          onChange={(e) => setWishInput(e.target.value)}
          maxLength={50}
          onKeyDown={(e) => e.key === 'Enter' && handleSendWish()}
        />
        <button className="wish-submit-btn" onClick={handleSendWish} disabled={isSending}>
          {isSending ? '...' : 'Gửi'}
        </button>
      </div>

      <div className="lucky-wheel-trigger" onClick={() => setShowWheelModal(true)}>
        VÒNG QUAY<br/>MAY MẮN
      </div>

      {showWheelModal && (
        <div className="wheel-modal-overlay">
          <div className="wheel-modal-content">
            <button className="close-modal-btn" onClick={() => setShowWheelModal(false)}>✕</button>
            <h2 style={{color: '#ffd700', textShadow: '0 0 10px red', marginBottom: '20px'}}>Vòng Quay Giáng Sinh</h2>
            <div className="wheel-board-wrapper">
              <div className="wheel-container">
                <div className="pointer"></div>
                <div className="wheel" style={{ transform: `rotate(${wheelDeg}deg)` }}>
                  {PRIZES_CONFIG.map((prize, index) => (
                    <div key={index} className="wheel-text" style={{ transform: `rotate(${prize.deg - 30}deg)` }}>
                      <span>{prize.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button className="spin-action-btn" onClick={handleSpin} disabled={isSpinning}>
              {isSpinning ? 'Đang quay...' : 'QUAY NGAY (20 XU)'}
            </button>
            {rewardMessage && <div style={{marginTop:'15px', color: '#fff', fontSize:'18px', fontWeight: 'bold'}}>{rewardMessage}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

const SnowfallManager: React.FC = () => {
    const snowflakes = React.useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => {
            const left = Math.floor(Math.random() * 100); 
            const fallDuration = Math.floor(Math.random() * 10) + 15; 
            const animationDelay = `-${Math.random() * 2}s`;
            const size = Math.floor(Math.random() * 25) + 10; 
            const rotationDuration = Math.floor(Math.random() * 8) + 5; 

            return (
                <div 
                    key={i} 
                    className="snowflake"
                    style={{
                        left: `${left}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        animationName: 'fall, rotate',
                        animationDuration: `${fallDuration}s, ${rotationDuration}s`, 
                        animationDelay: `${animationDelay}, ${animationDelay}`
                    }}
                >
                    {FLAKE_IMAGES.length > 0 ? (
                        <img 
                            src={FLAKE_IMAGES[0]} 
                            alt="snowflake" 
                            style={{width: '100%', height: '100%', display: 'block'}}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const span = document.createElement('span');
                                span.innerText = '❄';
                                span.style.fontSize = `${size}px`;
                                span.style.color = 'white';
                                span.style.display = 'block';
                                e.currentTarget.parentElement?.appendChild(span);
                            }}
                        />
                    ) : (
                        <span style={{fontSize: `${size}px`, color: 'white'}}>❄</span>
                    )}
                </div>
            );
        });
    }, []);

    return <>{snowflakes}</>;
};

const FlyingWishesManager: React.FC<{ wishes: DisplayWish[] }> = ({ wishes }) => {
  const [flyingItems, setFlyingItems] = useState<{id: number, wish: DisplayWish, top: number, duration: number}[]>([]);

  useEffect(() => {
    if (wishes.length === 0) return;
    const interval = setInterval(() => {
      setFlyingItems(current => {
        if (current.length > 6) return current;
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        const newItem = {
          id: Date.now(),
          wish: randomWish,
          top: Math.floor(Math.random() * 80),
          duration: Math.floor(Math.random() * 20) + 40 
        };
        return [...current, newItem];
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [wishes]);

  useEffect(() => {
    const cleanup = setInterval(() => {
        setFlyingItems(current => current.filter(item => Date.now() - item.id < 60000));
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <>
      {flyingItems.map((item) => (
        <div key={item.id} className="flying-wish" style={{ top: `${item.top}%`, animationDuration: `${item.duration}s` }}>
          <img src={item.wish.user.avatarUrl || DEFAULT_AVATAR} alt="user" onError={(e) => e.currentTarget.src = DEFAULT_AVATAR} />
          <span>{item.wish.content}</span>
        </div>
      ))}
    </>
  );
};

export default ChristmasEventPage;