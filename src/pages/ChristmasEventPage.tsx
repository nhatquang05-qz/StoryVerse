import React, { useState, useEffect } from 'react';
import '../assets/styles/ChristmasMinigame.css';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const bannerImg = "https://img.freepik.com/free-vector/merry-christmas-wallpaper-design_79603-2129.jpg"; 
const treeImg = "https://cdn-icons-png.flaticon.com/512/629/629546.png"; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const PRIZES_CONFIG = [
  { label: '10 Xu', deg: 30 },
  { label: '50 Xu', deg: 90 },
  { label: 'May mắn', deg: 150 },
  { label: '100 Xu', deg: 210 },
  { label: 'Voucher', deg: 270 },
  { label: 'Truyện In', deg: 330 }
];

const ChristmasEventPage: React.FC = () => {
  const { currentUser, token, fetchUser } = useAuth();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelDeg, setWheelDeg] = useState(0);
  const [rewardMessage, setRewardMessage] = useState('');
  
  const [wishes, setWishes] = useState<any[]>([]);
  const [wishInput, setWishInput] = useState('');
  const [loadingWish, setLoadingWish] = useState(false);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const res = await axios.get(`${API_URL}/minigame/wishes`);
        setWishes(res.data);
      } catch (error) {
        console.error("Không tải được lời chúc");
      }
    };
    fetchWishes();
  }, []);

  const handleSpin = async () => {
    if (!currentUser || !token) return toast.error("Vui lòng đăng nhập!");
    if (isSpinning) return;

    if ((currentUser.coinBalance || 0) < 20) {
        return toast.error("Bạn cần 20 Xu để quay!");
    }

    setIsSpinning(true);
    setRewardMessage('');

    try {
      const response = await axios.post(
          `${API_URL}/minigame/spin`, 
          {}, 
          { headers: { Authorization: `Bearer ${token}` }}
      );
      
      const { result } = response.data; 

      const targetPrize = PRIZES_CONFIG.find(p => p.label === result.label) || PRIZES_CONFIG[0];
      
      const spinAngle = wheelDeg + 1800 + (360 - targetPrize.deg); 
      setWheelDeg(spinAngle);

      setTimeout(() => {
        setIsSpinning(false);
        setRewardMessage(`🎉 Bạn nhận được: ${result.label}`);
        toast.success(`Chúc mừng! +${result.label}`);
        fetchUser();
      }, 4000);

    } catch (error: any) {
      setIsSpinning(false);
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi hệ thống quay thưởng";
      toast.error(msg);
    }
  };

  const handleSendWish = async () => {
    if (!currentUser || !token) return toast.error("Đăng nhập đi bạn ơi!");
    if (!wishInput.trim()) return;

    setLoadingWish(true);
    try {
      const res = await axios.post(
          `${API_URL}/minigame/wish`, 
          { content: wishInput },
          { headers: { Authorization: `Bearer ${token}` }}
      );

      const newWishObj = {
        id: Date.now(),
        username: currentUser.fullName || currentUser.fullName || 'Bạn', 
        avatar: currentUser.avatarUrl || '/default-avatar.png', 
        content: wishInput
      };
      
      setWishes([newWishObj, ...wishes]); 
      setWishInput('');
      toast.success(res.data.message);
      
      fetchUser();  

    } catch (error: any) {
      console.error("Lỗi gửi lời chúc:", error);
      const msg = error.response?.data?.message || "Lỗi server (500). Kiểm tra lại Backend.";
      toast.error(msg);
    } finally {
      setLoadingWish(false);
    }
  };

  return (
    <div className="xmas-container">
      <div className="xmas-banner">
        <img src={bannerImg} alt="Christmas Event Banner" />
        <h1 style={{color: '#ffd700', textShadow: '2px 2px 4px #000', marginTop: '10px'}}>
          Giáng Sinh Diệu Kỳ
        </h1>
      </div>

      <div className="game-layout">
        
        {/* --- VÒNG QUAY --- */}
        <div className="wheel-wrapper">
          <h2 style={{color: '#ff4d4d'}}>Vòng Quay May Mắn</h2>
          <p>Phí: 20 Xu / lượt</p>
          
          <div className="wheel-container">
            <div className="pointer"></div>
            <div 
              className="wheel" 
              style={{ transform: `rotate(${wheelDeg}deg)` }}
            >
              {PRIZES_CONFIG.map((prize, index) => (
                <div 
                  key={index} 
                  className="wheel-text"
                  style={{ transform: `rotate(${prize.deg - 30}deg)` }} 
                >
                  <span>{prize.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="spin-btn" 
            onClick={handleSpin} 
            disabled={isSpinning}
          >
            {isSpinning ? 'Đang quay...' : 'QUAY NGAY'}
          </button>

          {rewardMessage && (
            <div style={{marginTop:'15px', color: '#ffd700', fontWeight:'bold', fontSize:'18px'}}>
              {rewardMessage}
            </div>
          )}
        </div>

        {/* --- CÂY THÔNG --- */}
        <div className="tree-wrapper">
          <h2 style={{color: '#2ecc71', textAlign: 'center'}}>Cây Thông Ước Nguyện</h2>
          <p style={{textAlign: 'center', marginBottom: '15px'}}>Treo lời chúc nhận ngay 5 Xu 🎁</p>
          
          <div className="tree-visual" style={{
              height: '200px', 
              background: `url(${treeImg}) no-repeat center/contain`,
              marginBottom: '20px'
          }}></div>

          <div className="wish-form">
            <input 
              type="text" 
              className="wish-input" 
              placeholder="Nhập điều ước..." 
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
              maxLength={100}
              disabled={loadingWish}
            />
            <button 
                className="wish-btn" 
                onClick={handleSendWish}
                disabled={loadingWish}
            >
                {loadingWish ? '...' : 'Gửi'}
            </button>
          </div>

          <div className="wishes-list">
            {wishes.map((w, index) => (
              <div key={index} className="wish-item">
                <img 
                    src={w.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'} 
                    alt="ava" 
                    style={{width:'30px', height:'30px', borderRadius:'50%', objectFit:'cover'}}
                    onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png'}
                />
                <div>
                  <div style={{fontWeight: 'bold', fontSize: '13px', color: '#003366'}}>
                    {w.username}
                  </div>
                  <div style={{fontSize:'14px'}}>{w.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChristmasEventPage;