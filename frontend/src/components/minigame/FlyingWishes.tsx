import React, { useState, useEffect } from 'react';
import '../../assets/styles/minigame/FlyingWishes.css';
import { type DisplayWish, DEFAULT_AVATAR } from './minigameConstants';

interface Props {
	wishes: DisplayWish[];
}

const FlyingWishes: React.FC<Props> = ({ wishes }) => {
	const [flyingItems, setFlyingItems] = useState<
		{ id: number; wish: DisplayWish; top: number; duration: number }[]
	>([]);

	useEffect(() => {
		if (wishes.length === 0) return;
		const interval = setInterval(() => {
			setFlyingItems((current) => {
				if (current.length > 6) return current;
				const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
				const newItem = {
					id: Date.now(),
					wish: randomWish,
					top: Math.floor(Math.random() * 80),
					duration: Math.floor(Math.random() * 20) + 30,
				};
				return [...current, newItem];
			});
		}, 4000);
		return () => clearInterval(interval);
	}, [wishes]);

	useEffect(() => {
		const cleanup = setInterval(() => {
			setFlyingItems((current) => current.filter((item) => Date.now() - item.id < 60000));
		}, 5000);
		return () => clearInterval(cleanup);
	}, []);

	return (
		<div className="flying-wishes-zone">
			{flyingItems.map((item) => (
				<div
					key={item.id}
					className="flying-wish"
					style={{ top: `${item.top}%`, animationDuration: `${item.duration}s` }}
				>
					<img
						src={item.wish.user.avatarUrl || DEFAULT_AVATAR}
						alt="user"
						onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)}
					/>
					<span>{item.wish.content}</span>
				</div>
			))}
		</div>
	);
};

export default FlyingWishes;
