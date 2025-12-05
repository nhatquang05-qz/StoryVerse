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
  decors: [decor1, decor2, decor3, decor4, decor5, decor6]
};

export const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

export const PRIZES_CONFIG = [
  { label: '10 Xu', deg: 30 },
  { label: '50 Xu', deg: 90 },
  { label: 'May mắn', deg: 150 },
  { label: '100 Xu', deg: 210 },
  { label: 'Voucher', deg: 270 },
  { label: 'Truyện In', deg: 330 }
];

export const WHEEL_LABELS = [
    '10 Xu', '50 Xu', '10 Xu', 'May mắn', '10 Xu',
    '50 Xu', '10 Xu', 'May mắn', '50 Xu', '10 Xu',
    '500 Xu', '10 xu', '50 Xu', 'Truyện', 'May mắn'
];

export interface DisplayWish {
  _id: string | number;
  user: { fullName: string; avatarUrl: string; };
  content: string;
  top: number; 
  left: number;
  decorIndex: number;
  animationDelay: number;
}