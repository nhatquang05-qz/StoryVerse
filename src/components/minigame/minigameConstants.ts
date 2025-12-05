import treeImg from '../../assets/images/minigameChristmas/christmas_tree.png';
import decor1 from '../../assets/images/minigameChristmas/decor1.png';
import decor2 from '../../assets/images/minigameChristmas/decor2.png';
import decor3 from '../../assets/images/minigameChristmas/decor3.png';
import decor4 from '../../assets/images/minigameChristmas/decor4.png';
import decor5 from '../../assets/images/minigameChristmas/decor5.png';
import decor6 from '../../assets/images/minigameChristmas/decor6.png';
import flake1 from '../../assets/images/minigameChristmas/flake.png';
import backgroundImg from '../../assets/images/minigameChristmas/background.jpg';
import coinImg from '../../assets/images/coin.avif';

export const IMAGES = {
	tree: treeImg,
	background: backgroundImg,
	coin: coinImg,
	flakes: [flake1],
	decors: [decor1, decor2, decor3, decor4, decor5, decor6],
};

export const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';

// DANH SÁCH 15 Ô - BẮT BUỘC KHỚP VỚI BACKEND
// Thứ tự: ID 1 -> ID 15
export const WHEEL_LABELS = [
	'10 Xu', // 1
	'50 Xu', // 2
	'10 Xu', // 3
	'May mắn', // 4
	'10 Xu', // 5
	'50 Xu', // 6
	'10 Xu', // 7
	'May mắn', // 8
	'50 Xu', // 9
	'10 Xu', // 10
	'500 Xu', // 11
	'May mắn', // 12
	'50 Xu', // 13
	'10 Xu', // 14
	'Truyện In', // 15
];

export const SEGMENT_ANGLE = 24;
export const INITIAL_WHEEL_DEG = 12;
export const PRIZES_CONFIG = WHEEL_LABELS.map((label, index) => ({
	label,
	deg: index * SEGMENT_ANGLE,
}));

export interface DisplayWish {
	_id: string | number;
	user: { fullName: string; avatarUrl: string };
	content: string;
	top: number;
	left: number;
	decorIndex: number;
	animationDelay: number;
}
