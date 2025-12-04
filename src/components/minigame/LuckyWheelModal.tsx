import React from 'react';
import '../../assets/styles/minigame/LuckyWheel.css';
import { PRIZES_CONFIG } from './minigameConstants';

interface Props {
	isOpen: boolean;
	onClose: () => void;
	isSpinning: boolean;
	handleSpin: () => void;
	wheelDeg: number;
	rewardMessage: string;
}

const LuckyWheelModal: React.FC<Props> = ({
	isOpen,
	onClose,
	isSpinning,
	handleSpin,
	wheelDeg,
	rewardMessage,
}) => {
	if (!isOpen)
		return (
			<div className="lucky-wheel-trigger" onClick={onClose}>
				VÒNG QUAY
				<br />
				MAY MẮN
			</div>
		);

	return (
		<div className="wheel-modal-overlay">
			<div className="wheel-modal-content">
				<button className="close-modal-btn" onClick={onClose}>
					✕
				</button>
				<h2
					style={{
						color: '#ffd700',
						textShadow: '0 0 10px red',
						marginBottom: '30px',
						fontSize: '2.5rem',
						fontFamily: 'Arial, sans-serif',
						fontWeight: 'bold',
					}}
				>
					VÒNG QUAY GIÁNG SINH
				</h2>
				<div className="wheel-board-wrapper">
					<div className="wheel-container">
						<div className="pointer"></div>
						<div className="wheel" style={{ transform: `rotate(${wheelDeg}deg)` }}>
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
				</div>
				<button className="spin-action-btn" onClick={handleSpin} disabled={isSpinning}>
					{isSpinning ? 'ĐANG QUAY...' : 'QUAY NGAY (20 XU)'}
				</button>
				{rewardMessage && (
					<div
						style={{
							marginTop: '25px',
							color: '#fff',
							fontSize: '22px',
							fontWeight: 'bold',
							textShadow: '0 0 5px black',
						}}
					>
						{rewardMessage}
					</div>
				)}
			</div>
		</div>
	);
};

export default LuckyWheelModal;
