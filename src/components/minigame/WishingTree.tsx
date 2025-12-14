import React from 'react';
import '../../assets/styles/minigame/WishingTree.css';
import { type DisplayWish, IMAGES } from './minigameConstants';

interface Props {
	wishes: DisplayWish[];
}

const noDragStyle: React.CSSProperties = {
	userSelect: 'none',
	WebkitUserSelect: 'none',
	WebkitUserDrag: 'none',
} as React.CSSProperties;

const WishingTree: React.FC<Props> = ({ wishes }) => {
	return (
		<div className="tree-display-area">
			<img
				src={IMAGES.tree}
				alt="Christmas Tree"
				className="main-tree-img"
				draggable={false}
				onContextMenu={(e) => e.preventDefault()}
				style={{
					...noDragStyle,
					objectFit: 'contain',
				}}
			/>

			{wishes.map((w) => (
				<div
					key={w._id}
					className="tree-decor"
					style={{
						top: `${w.top}%`,
						left: `${w.left}%`,
						animationDelay: `${w.animationDelay}s`,
					}}
				>
					<img
						src={IMAGES.decors[w.decorIndex]}
						alt="decor"
						draggable={false}
						onContextMenu={(e) => e.preventDefault()}
						style={{ ...noDragStyle, width: '100%', height: '100%' }}
					/>

					<div className="decor-tooltip">
						<span className="decor-user">{w.user.fullName}</span>"{w.content}"
					</div>
				</div>
			))}
		</div>
	);
};

export default WishingTree;
