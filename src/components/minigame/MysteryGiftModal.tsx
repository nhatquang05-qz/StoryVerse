import React, { useEffect, useState } from 'react';
import '../../assets/styles/minigame/MysteryGift.css';
import { IMAGES } from './minigameConstants';
import { FaCopy, FaTicketAlt } from 'react-icons/fa';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	isSpinning: boolean;
	handleSpin: () => void;
	rewardMessage: string;
	freeSpins: number;
	finalReward: any;
}

const MysteryGiftModal: React.FC<Props> = ({
	isOpen,
	onClose,
	isSpinning,
	handleSpin,
	rewardMessage,
	freeSpins,
	finalReward,
}) => {
	const [showResult, setShowResult] = useState(false);

	useEffect(() => {
		if (isSpinning) {
			setShowResult(false);
		}
	}, [isSpinning]);

	useEffect(() => {
		if (!isSpinning && rewardMessage) {
			setShowResult(true);
		}
	}, [isSpinning, rewardMessage]);

	const handleCopyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		alert('Đã sao chép mã voucher!');
	};

	if (!isOpen) return null;

	return (
		<div className="gift-modal-overlay">
			<div className="gift-modal-content">
				<button className="event-close-modal-btn" onClick={onClose} disabled={isSpinning}>
					✕
				</button>

				<h2 className="gift-title">HỘP QUÀ GIÁNG SINH</h2>

				<div className="gift-container">
					<div className="glow-effect"></div>
					<div
						className={`gift-box ${isSpinning ? 'shaking' : ''} ${showResult ? 'opened' : ''}`}
					>
						<div className="gift-lid"></div>
						<div className="gift-body">
							<div className="gift-ribbon-v"></div>
							<div className="gift-ribbon-h"></div>
						</div>
					</div>

					{showResult && (
						<div className="prize-reveal">
							<div className="prize-icon">
								{finalReward?.type === 'coin' && (
									<img src={IMAGES.coin} alt="Coin" className="bounce-in" />
								)}
								{finalReward?.type === 'voucher' && (
									<div className="voucher-icon bounce-in">
										<FaTicketAlt size={50} color="#f59e0b" />
									</div>
								)}
							</div>

							{finalReward?.type === 'voucher' ? (
								<div className="voucher-win-container">
									<div className="prize-label" style={{ marginBottom: '10px' }}>
										Chúc mừng! Bạn nhận được Voucher
									</div>
									<div className="voucher-ticket-box">
										<span className="voucher-code-text">
											{finalReward.value}
										</span>
										<button
											className="btn-copy-voucher"
											onClick={() => handleCopyCode(finalReward.value)}
											title="Sao chép mã"
										>
											<FaCopy /> Sao chép
										</button>
									</div>
									<p className="voucher-note">
										(Áp dụng cho đơn hàng từ 0đ. Hạn dùng: 7 ngày)
									</p>
								</div>
							) : (
								<div className="prize-label">
									{finalReward?.label || rewardMessage}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="spin-controls">
					<p className="spin-info">
						Bạn có: <strong>{freeSpins}</strong> lượt miễn phí
					</p>

					{!showResult ? (
						<button
							className="open-gift-btn"
							onClick={handleSpin}
							disabled={isSpinning}
						>
							{isSpinning
								? 'ĐANG MỞ...'
								: freeSpins > 0
									? 'MỞ QUÀ NGAY'
									: 'MỞ (20 XU)'}
						</button>
					) : (
						<button
							className="open-gift-btn confirm"
							onClick={() => {
								setShowResult(false);
							}}
						>
							CHƠI TIẾP
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default MysteryGiftModal;
