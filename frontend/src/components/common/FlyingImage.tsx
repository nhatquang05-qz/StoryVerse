import React, { useEffect, useState } from 'react';
import '../../assets/styles/FlyingImage.css';

interface FlyingImageProps {
	src: string | null;
	startRect: DOMRect | null;
	endRect: DOMRect | null;
	onAnimationEnd: () => void;
}

const FlyingImage: React.FC<FlyingImageProps> = ({ src, startRect, endRect, onAnimationEnd }) => {
	const [styles, setStyles] = useState<React.CSSProperties>({});

	useEffect(() => {
		if (src && startRect && endRect) {
			setStyles({
				display: 'block',
				left: `${startRect.left + startRect.width / 2}px`,
				top: `${startRect.top + startRect.height / 2}px`,
				width: `${startRect.width}px`,
				height: `${startRect.height}px`,
				opacity: 1,
				transform: 'translate(-50%, -50%) scale(1)',
			});

			const timer = setTimeout(() => {
				setStyles({
					display: 'block',
					left: `${endRect.left + endRect.width / 2}px`,
					top: `${endRect.top + endRect.height / 2}px`,
					width: '30px',
					height: 'auto',
					opacity: 0,
					transform: 'translate(-50%, -50%) scale(0.1)',
				});
			}, 50);

			const animationDuration = 600;
			const endTimer = setTimeout(onAnimationEnd, animationDuration + 100);

			return () => {
				clearTimeout(timer);
				clearTimeout(endTimer);
			};
		} else {
			setStyles({ display: 'none' });
		}
	}, [src, startRect, endRect, onAnimationEnd]);

	if (!src) return null;

	return <img src={src} alt="Flying item" className="flying-image" style={styles} />;
};

export default FlyingImage;
