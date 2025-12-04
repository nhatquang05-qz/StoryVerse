import React from 'react';
import '../../assets/styles/minigame/WishingTree.css';
import { type DisplayWish, IMAGES } from './minigameConstants';

interface Props {
	wishes: DisplayWish[];
}

const WishingTree: React.FC<Props> = ({ wishes }) => {
	return (
		<div className="tree-display-area">
			<img src={IMAGES.tree} alt="Christmas Tree" className="main-tree-img" />
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
						style={{ width: '100%', height: '100%' }}
					/>
					<div className="decor-tooltip">
						<span className="decor-user">{w.user.fullName}</span> "{w.content}"
					</div>
				</div>
			))}
		</div>
	);
};

export default WishingTree;
