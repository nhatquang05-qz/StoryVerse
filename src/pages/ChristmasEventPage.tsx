import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/minigame/ChristmasEventPage.css';
import {
	IMAGES,
	PRIZES_CONFIG,
	type DisplayWish,
	DEFAULT_AVATAR,
} from '../components/minigame/minigameConstants';
import Snowfall from '../components/minigame/Snowfall';
import FlyingWishes from '../components/minigame/FlyingWishes';
import WishingTree from '../components/minigame/WishingTree';
import LuckyWheelModal from '../components/minigame/LuckyWheelModal';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
		const maxSpread = 40 - ((40 - 10) * (80 - top)) / (80 - 15);
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
						avatarUrl: w.avatarUrl || w.avatar || DEFAULT_AVATAR,
					},
					top: getRandomTreePosition().top,
					left: getRandomTreePosition().left,
					decorIndex: Math.floor(Math.random() * IMAGES.decors.length),
					animationDelay: Math.random() * 2,
				}));
				setDisplayWishes(mapped);
			} catch (error) {
				console.error('Lỗi tải lời chúc', error);
			}
		};
		fetchWishes();
	}, []);

	const handleSpin = async () => {
		if (!currentUser || !token) return toast.error('Đăng nhập để quay!');
		if ((currentUser.coinBalance || 0) < 20) return toast.error('Bạn cần 20 Xu!');
		if (isSpinning) return;

		setIsSpinning(true);
		setRewardMessage('');

		try {
			const response = await axios.post(
				`${API_URL}/minigame/spin`,
				{},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			const { result } = response.data;
			const targetPrize =
				PRIZES_CONFIG.find((p) => p.label === result.label) || PRIZES_CONFIG[0];
			const spinAngle = wheelDeg + 1800 + (360 - targetPrize.deg);
			setWheelDeg(spinAngle);

			setTimeout(() => {
				setIsSpinning(false);
				setRewardMessage(`🎉 Bạn nhận được: ${result.label}`);
				toast.success(`Chúc mừng! Bạn trúng ${result.label}`);
				fetchUser();
			}, 5000);
		} catch (error: any) {
			setIsSpinning(false);
			toast.error(error.response?.data?.message || 'Lỗi quay thưởng');
		}
	};

	const handleSendWish = async () => {
		if (!currentUser || !token) return toast.error('Vui lòng đăng nhập!');
		if (!wishInput.trim()) return;

		setIsSending(true);
		try {
			const res = await axios.post(
				`${API_URL}/minigame/wish`,
				{ content: wishInput },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			const { top, left } = getRandomTreePosition();
			const newWish: DisplayWish = {
				_id: Date.now(),
				user: {
					fullName: currentUser.fullName || 'Bạn',
					avatarUrl: currentUser.avatarUrl || DEFAULT_AVATAR,
				},
				content: wishInput,
				top,
				left,
				decorIndex: Math.floor(Math.random() * IMAGES.decors.length),
				animationDelay: 0,
			};
			setDisplayWishes((prev) => [newWish, ...prev]);
			setWishInput('');
			toast.success(res.data.message);
			fetchUser();
		} catch (error: any) {
			toast.error('Lỗi gửi lời chúc');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div
			className="xmas-container"
			style={{
				backgroundImage: `url(${IMAGES.background})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
			}}
		>
			<button className="back-home-btn" onClick={() => navigate('/')}>
				⬅ Trang chủ
			</button>

			{currentUser && (
				<div className="user-header-info">
					<div className="user-details">
						<span className="user-name">{currentUser.fullName || 'Người chơi'}</span>
						<span className="user-coins">
							<img src={IMAGES.coin} alt="coin" className="coin-icon" />
							{currentUser.coinBalance?.toLocaleString() || 0} Xu
						</span>
					</div>
					<img
						src={currentUser.avatarUrl || DEFAULT_AVATAR}
						alt="avatar"
						className="user-avatar-top"
						onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
					/>
				</div>
			)}

			<Snowfall />

			<FlyingWishes wishes={displayWishes} />

			<WishingTree wishes={displayWishes} />

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
					{isSending ? '...' : 'GỬI'}
				</button>
			</div>

			<LuckyWheelModal
				isOpen={showWheelModal}
				onClose={() => setShowWheelModal(!showWheelModal)}
				isSpinning={isSpinning}
				handleSpin={handleSpin}
				wheelDeg={wheelDeg}
				rewardMessage={rewardMessage}
			/>
		</div>
	);
};

export default ChristmasEventPage;
