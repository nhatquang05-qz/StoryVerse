import treeImg from '../../assets/images/minigameChristmas/christmas_tree.webp';
import decor1 from '../../assets/images/minigameChristmas/decor1.webp';
import decor2 from '../../assets/images/minigameChristmas/decor2.webp';
import decor3 from '../../assets/images/minigameChristmas/decor3.webp';
import decor4 from '../../assets/images/minigameChristmas/decor4.webp';
import decor5 from '../../assets/images/minigameChristmas/decor5.webp';
import decor6 from '../../assets/images/minigameChristmas/decor6.webp';
import flake1 from '../../assets/images/minigameChristmas/flake.avif';
import backgroundImg from '../../assets/images/minigameChristmas/background.webp';
import coinImg from '../../assets/images/coin.avif';

export const IMAGES = {
	tree: treeImg,
	background: backgroundImg,
	coin: coinImg,
	flakes: [flake1],
	decors: [decor1, decor2, decor3, decor4, decor5, decor6],
};

export const DEFAULT_AVATAR = 'https://cdn-icons-webp.flaticon.com/512/847/847969.webp';

export interface DisplayWish {
	_id: string | number;
	user: { fullName: string; avatarUrl: string };
	content: string;
	top: number;
	left: number;
	decorIndex: number;
	animationDelay: number;
}
