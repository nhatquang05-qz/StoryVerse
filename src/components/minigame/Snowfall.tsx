import React, { useMemo } from 'react';
import '../../assets/styles/minigame/Snowfall.css';
import { IMAGES } from './minigameConstants';

const Snowfall: React.FC = () => {
	const snowflakes = useMemo(() => {
		return Array.from({ length: 60 }).map((_, i) => {
			const left = Math.floor(Math.random() * 100);
			const fallDuration = Math.floor(Math.random() * 15) + 15;
			const animDelay = -(Math.random() * 20);
			const size = Math.floor(Math.random() * 25) + 15;

			return (
				<div
					key={i}
					className="snowflake"
					style={{
						left: `${left}%`,
						width: `${size}px`,
						height: `${size}px`,
						animationName: 'fall-infinite',
						animationDuration: `${fallDuration}s`,
						animationTimingFunction: 'linear',
						animationIterationCount: 'infinite',
						animationDelay: `${animDelay}s`,
					}}
				>
					<div className="snowflake-char">❄</div>
					<img
						src={IMAGES.flakes[0]}
						alt=""
						onError={(e) => (e.currentTarget.style.display = 'none')}
						onLoad={(e) =>
							e.currentTarget.parentElement
								?.querySelector('.snowflake-char')
								?.setAttribute('style', 'display: none')
						}
						style={{ position: 'absolute', top: 0, left: 0 }}
					/>
				</div>
			);
		});
	}, []);

	return <div className="snowfall-zone">{snowflakes}</div>;
};

export default Snowfall;
