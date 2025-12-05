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

export interface DisplayWish {
	_id: string | number;
	user: { fullName: string; avatarUrl: string };
	content: string;
	top: number;
	left: number;
	decorIndex: number;
	animationDelay: number;
}
