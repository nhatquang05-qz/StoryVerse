// src/data/mockData.ts
export interface Comic {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
}

export const comics: Comic[] = [
  {
    id: 1,
    title: 'Chú Thuật Hồi Chiến - Tập 10',
    author: 'Gege Akutami',
    price: 30000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chu-thuat-hoi-chien---tap-10.jpg',
  },
  {
    id: 2,
    title: 'Thanh Gươm Diệt Quỷ - Tập 23',
    author: 'Koyoharu Gotouge',
    price: 28000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg',
  },
  {
    id: 3,
    title: 'Học Viện Siêu Anh Hùng - Tập 35',
    author: 'Kohei Horikoshi',
    price: 32000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hoc-vien-sieu-anh-hung---tap-35---bia-ao.jpg',
  },
  {
    id: 4,
    title: 'One Piece - Tập 104',
    author: 'Eiichiro Oda',
    price: 25000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg',
  },
  // Thêm 4 cuốn nữa cho đủ 2 hàng
  {
    id: 5,
    title: 'SPY x FAMILY - Tập 9',
    author: 'Tatsuya Endo',
    price: 50000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/p/spy-x-family---tap-9_bia_1_2.jpg',
  },
  {
    id: 6,
    title: 'Kaiju No. 8 - Tập 5',
    author: 'Naoya Matsumoto',
    price: 30000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/k/a/kaiju-no.-8---tap-5---bia-thuong_1.jpg',
  },
  {
    id: 7,
    title: 'Blue Lock - Tập 15',
    author: 'Yusuke Nomura',
    price: 35000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/b/l/blue-lock---tap-15---bia-ao---tang-kem-standee.jpg',
  },
  {
    id: 8,
    title: 'Doraemon Truyện Dài - Tập 1',
    author: 'Fujiko F Fujio',
    price: 22000,
    imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---tap-1---bia-mem-tai-ban-2023.jpg',
  },
];