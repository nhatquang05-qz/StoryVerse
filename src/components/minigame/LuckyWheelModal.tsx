import React from 'react';
import '../../assets/styles/minigame/LuckyWheel.css';
import { PRIZES_CONFIG, WHEEL_LABELS } from './minigameConstants';

const WHEEL_GRADIENT = "conic-gradient(#ffffff 0deg 24deg, #ff4d4d 24deg 48deg, #ffffff 48deg 72deg, #2ecc71 72deg 96deg, #ffffff 96deg 120deg, #ff4d4d 120deg 144deg, #ffffff 144deg 168deg, #2ecc71 168deg 192deg, #ff4d4d 192deg 216deg, #ffffff 216deg 240deg, #c9c29fff 240deg 264deg, #2ecc71 264deg 288deg, #ff4d4d 288deg 312deg, #ffffff 312deg 336deg, #eeff00ff 336deg 360deg)";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	isSpinning: boolean;
	handleSpin: () => void;
	wheelDeg: number;
	rewardMessage: string;
	freeSpins: number;
	transitionStyle: string;
}

const LuckyWheelModal: React.FC<Props> = ({ 
	isOpen, onClose, isSpinning, handleSpin, 
	wheelDeg, rewardMessage, freeSpins, transitionStyle 
}) => {
	if (!isOpen) return null;

	return (
		<div className="wheel-modal-overlay">
			<div className="wheel-modal-content">
				<button className="close-modal-btn" onClick={onClose} disabled={isSpinning}>✕</button>
				
				<h2 style={{color: '#ffd700', marginBottom: '20px', fontSize: '2rem', textShadow: '0 0 10px #c0392b'}}>
					VÒNG QUAY GIÁNG SINH
				</h2>
				
				<div className="wheel-board-wrapper">
					<div className="wheel-container">
						<div className="pointer"></div>
						<div 
							className="wheel" 
							style={{ 
								transform: `rotate(${wheelDeg}deg)`, 
								background: WHEEL_GRADIENT,
								transition: transitionStyle 
							}}
						>
							{WHEEL_LABELS.map((label, index) => (
								<div 
									key={index} 
									className="wheel-text" 
									style={{ transform: `rotate(${index * 24 + 12}deg)` }}
								>
									<span style={{
										color: label === 'Truyện In' ? '#ffd700' : '#003366',
										textShadow: label === 'Truyện In' ? '0 0 5px red' : 'none'
									}}>
										{label}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
				
				<div className="spin-controls" style={{marginTop: '30px'}}>
					<p style={{color: '#fff', marginBottom: '15px', fontSize: '18px'}}>
						Bạn có: <strong style={{color: '#2ecc71'}}>{freeSpins}</strong> lượt miễn phí
					</p>
					<button className="spin-action-btn" onClick={handleSpin} disabled={isSpinning}>
						{isSpinning ? 'ĐANG QUAY...' : (freeSpins > 0 ? 'QUAY MIỄN PHÍ' : 'QUAY (20 XU)')}
					</button>
				</div>
				
				{rewardMessage && (
					<div style={{marginTop:'20px', color: '#ffd700', fontSize:'22px', fontWeight:'bold', textShadow: '0 0 5px black', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '10px'}}>
						{rewardMessage}
					</div>
				)}
			</div>
		</div>
	);
};

export default LuckyWheelModal;