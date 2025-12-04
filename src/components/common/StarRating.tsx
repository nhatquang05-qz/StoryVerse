import React from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
	rating: number | string | null | undefined;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
	const rawRating = parseFloat(String(rating)) || 0;

	const displayRating = Math.round(rawRating * 10) / 10;

	const starRatingValue = Math.round(rawRating * 2) / 2;

	const renderStars = () => {
		return Array.from({ length: 5 }, (_, index) => {
			const starValue = index + 1;
			let fillStyle: 'full' | 'half' | 'none' = 'none';

			if (starValue <= starRatingValue) {
				fillStyle = 'full';
			} else if (starValue - 0.5 === starRatingValue) {
				fillStyle = 'half';
			}

			return (
				<FiStar
					key={index}
					className={`star-icon star-${fillStyle}`}
					fill={
						fillStyle === 'full'
							? '#ffc107'
							: fillStyle === 'half'
								? `url(#half-fill-product-card-${index})`
								: 'none'
					}
					stroke={'#ffc107'}
				/>
			);
		});
	};

	const halfStarGradient = (
		<svg width="0" height="0" className="hidden-gradient">
			{Array.from({ length: 5 }).map((_, index) => (
				<linearGradient
					key={index}
					id={`half-fill-product-card-${index}`}
					x1="0%"
					y1="0%"
					x2="100%"
					y2="0%"
				>
					<stop offset="50%" style={{ stopColor: '#ffc107', stopOpacity: 1 }} />
					<stop offset="50%" style={{ stopColor: 'transparent', stopOpacity: 1 }} />
				</linearGradient>
			))}
		</svg>
	);

	return (
		<div className="star-rating-container">
			{halfStarGradient}
			<div className="star-rating-icons">{renderStars()}</div>
			<span className="rating-text">{displayRating.toFixed(1)}</span>
		</div>
	);
};

export default StarRating;
