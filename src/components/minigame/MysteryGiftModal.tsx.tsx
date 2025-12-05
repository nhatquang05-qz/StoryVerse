import React, { useEffect, useState } from 'react';
import '../../assets/styles/minigame/MysteryGift.css';
import { IMAGES } from './minigameConstants';

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

	if (!isOpen) return null;

	return (
		<div className="gift-modal-overlay">
			<div className="gift-modal-content">
				<button className="close-modal-btn" onClick={onClose} disabled={isSpinning}>
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
									<img src={IMAGES.coin} alt="Coin" />
								)}
								{finalReward?.type === 'gift' && <span>📚</span>}
								{finalReward?.type === 'luck' && <span>🍀</span>}
							</div>
							<div className="prize-label">{finalReward?.label}</div>
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
								// Reset về trạng thái chờ
							}}
						>
							CHƠI TIẾP
						</button>
					)}
				</div>

				{showResult && rewardMessage && (
					<div className="reward-message-box">{rewardMessage}</div>
				)}
			</div>
		</div>
	);
};

export default MysteryGiftModal;
