import React from 'react';
import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
	rating: number | string | null | undefined;
	size?: number;
	maxStars?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 16, maxStars = 5 }) => {
	const rawRating = parseFloat(String(rating)) || 0;

	const displayRating = Math.round(rawRating * 10) / 10;
	const starRatingValue = Math.round(rawRating * 2) / 2;

	const renderStars = () => {
		return Array.from({ length: maxStars }, (_, index) => {
			const starValue = index + 1;
			let fillStyle: 'full' | 'half' | 'none' = 'none';

			if (maxStars === 1) {
				fillStyle = 'full';
			} else {
				if (starValue <= starRatingValue) {
					fillStyle = 'full';
				} else if (starValue - 0.5 === starRatingValue) {
					fillStyle = 'half';
				}
			}

			return (
				<FiStar
					key={index}
					className={`star-icon star-${fillStyle}`}
					size={size}
					fill={
						fillStyle === 'full'
							? '#ffc107'
							: fillStyle === 'half'
								? `url(#half-fill-product-card-${index})`
								: 'none'
					}
					stroke={'#ffc107'}
					style={{ minWidth: size }}
				/>
			);
		});
	};

	const halfStarGradient = (
		<svg
			width="0"
			height="0"
			className="hidden-gradient"
			style={{ position: 'absolute', visibility: 'hidden' }}
		>
			{Array.from({ length: maxStars }).map((_, index) => (
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
		<div
			className="star-rating-container"
			style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
		>
			{halfStarGradient}
			<div className="star-rating-icons" style={{ display: 'flex' }}>
				{renderStars()}
			</div>
			{maxStars > 1 && (
				<span className="rating-text" style={{ fontSize: size * 0.8, marginLeft: 4 }}>
					{displayRating.toFixed(1)}
				</span>
			)}
		</div>
	);
};

export default StarRating;
