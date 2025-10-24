// src/data/mockData.ts
export interface Comic {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
}

// 30 PHYSICAL COMICS (ID 1-30)
export const physicalComics: Comic[] = [
  { id: 1, title: 'Chú Thuật Hồi Chiến - Tập 10', author: 'Gege Akutami', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chu-thuat-hoi-chien---tap-10.jpg', isDigital: false },
  { id: 2, title: 'Thanh Gươm Diệt Quỷ - Tập 23', author: 'Koyoharu Gotouge', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg', isDigital: false },
  { id: 3, title: 'Học Viện Siêu Anh Hùng - Tập 35', author: 'Kohei Horikoshi', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hoc-vien-sieu-anh-hung---tap-35---bia-ao.jpg', isDigital: false },
  { id: 4, title: 'One Piece - Tập 104', author: 'Eiichiro Oda', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: false },
  { id: 5, title: 'SPY x FAMILY - Tập 9', author: 'Tatsuya Endo', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/p/spy-x-family---tap-9_bia_1_2.jpg', isDigital: false },
  { id: 6, title: 'Kaiju No. 8 - Tập 5', author: 'Naoya Matsumoto', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/k/a/kaiju-no.-8---tap-5---bia-thuong_1.jpg', isDigital: false },
  { id: 7, title: 'Blue Lock - Tập 15', author: 'Yusuke Nomura', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/b/l/blue-lock---tap-15---bia-ao---tang-kem-standee.jpg', isDigital: false },
  { id: 8, title: 'Doraemon Truyện Dài - Tập 1', author: 'Fujiko F Fujio', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---tap-1---bia-mem-tai-ban-2023.jpg', isDigital: false },
  { id: 9, title: 'Attack on Titan - Tập 34', author: 'Hajime Isayama', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36802.jpg', isDigital: false },
  { id: 10, title: 'Tokyo Revengers - Tập 20', author: 'Ken Wakui', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: false },
  { id: 11, title: 'Boruto - Tập 18', author: 'Ukyō Kodachi', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: false },
  { id: 12, title: 'Black Clover - Tập 30', author: 'Yūki Tabata', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: false },
  { id: 13, title: 'Fairy Tail - Tập 63', author: 'Hiro Mashima', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: false },
  { id: 14, title: 'Haikyuu!! - Tập 45', author: 'Haruichi Furudate', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847951.jpg', isDigital: false },
  { id: 15, title: 'Dr. STONE - Tập 26', author: 'Riichiro Inagaki', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: false },
  { id: 16, title: 'Conan - Tập 101', author: 'Gosho Aoyama', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: false },
  { id: 17, title: 'Jujutsu Kaisen - Tập 15', author: 'Gege Akutami', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chuthuathoichien_tap15.jpg', isDigital: false },
  { id: 18, title: 'Chainsaw Man - Tập 11', author: 'Tatsuki Fujimoto', price: 38000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: false },
  { id: 19, title: 'Fullmetal Alchemist - Tập 27', author: 'Hiromu Arakawa', price: 45000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244845018.jpg', isDigital: false },
  { id: 20, title: 'My Hero Academia - Tập 30', author: 'Kohei Horikoshi', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: false },
  { id: 21, title: 'One Piece - Tập 105', author: 'Eiichiro Oda', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: false },
  { id: 22, title: 'Thám Tử Lừng Danh Conan - Tập 102', author: 'Gosho Aoyama', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: false },
  { id: 23, title: 'Naruto - Tập 72', author: 'Masashi Kishimoto', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: false },
  { id: 24, title: 'Dragon Ball Super - Tập 18', author: 'Toyotarou', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: false },
  { id: 25, title: 'Vinland Saga - Tập 15', author: 'Makoto Yukimura', price: 60000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/v/i/vinland-saga-tap-10.jpg', isDigital: false },
  { id: 26, title: 'Slam Dunk - Tập 20', author: 'Takehiko Inoue', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/l/slam-dunk-tap-31.jpg', isDigital: false },
  { id: 27, title: 'Bleach - Tập 74', author: 'Tite Kubo', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: false },
  { id: 28, title: 'Gintama - Tập 77', author: 'Hideaki Sorachi', price: 38000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: false },
  { id: 29, title: 'Hajime no Ippo - Tập 135', author: 'George Morikawa', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: false },
  { id: 30, title: 'Kingdom - Tập 61', author: 'Yasuhisa Hara', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847128.jpg', isDigital: false },
];

// 30 DIGITAL COMICS (ID 31-60)
export const digitalComics: Comic[] = [
  { id: 31, title: 'One Punch Man - Tập 24 (Digital)', author: 'Yusuke Murata', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849610.jpg', isDigital: true },
  { id: 32, title: 'Demon Slayer - Tập 15 (Digital)', author: 'Koyoharu Gotouge', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849306.jpg', isDigital: true },
  { id: 33, title: 'Fire Force - Tập 25 (Digital)', author: 'Atsushi Ohkubo', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/f/i/fireforce_tap25.jpg', isDigital: true },
  { id: 34, title: 'The Promised Neverland - Tập 20 (Digital)', author: 'Kaiu Shirai', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848521.jpg', isDigital: true },
  { id: 35, title: 'Jojo Bizarre Adventure - Tập 5 (Digital)', author: 'Hirohiko Araki', price: 55000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/j/o/jojo_s-bizarre-adventure-tap-5.jpg', isDigital: true },
  { id: 36, title: 'Hunter x Hunter - Tập 36 (Digital)', author: 'Yoshihiro Togashi', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847425.jpg', isDigital: true },
  { id: 37, title: 'Vinland Saga - Tập 10 (Digital)', author: 'Makoto Yukimura', price: 60000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/v/i/vinland-saga-tap-10.jpg', isDigital: true },
  { id: 38, title: 'Kingdom - Tập 60 (Digital)', author: 'Yasuhisa Hara', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847128.jpg', isDigital: true },
  { id: 39, title: 'Slam Dunk - Tập 31 (Digital)', author: 'Takehiko Inoue', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/l/slam-dunk-tap-31.jpg', isDigital: true },
  { id: 40, title: 'Death Note - Tập 12 (Digital)', author: 'Tsugumi Ohba', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/e/death-note-tap-12.jpg', isDigital: true },
  { id: 41, title: 'Haikyuu!! - Tập 25 (Digital)', author: 'Haruichi Furudate', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847951.jpg', isDigital: true },
  { id: 42, title: 'Dr. STONE - Tập 10 (Digital)', author: 'Riichiro Inagaki', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: true },
  { id: 43, title: 'Conan - Tập 90 (Digital)', author: 'Gosho Aoyama', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: true },
  { id: 44, title: 'Jujutsu Kaisen - Tập 10 (Digital)', author: 'Gege Akutami', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chuthuathoichien_tap15.jpg', isDigital: true },
  { id: 45, title: 'Chainsaw Man - Tập 5 (Digital)', author: 'Tatsuki Fujimoto', price: 38000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: true },
  { id: 46, title: 'Fullmetal Alchemist - Tập 10 (Digital)', author: 'Hiromu Arakawa', price: 45000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244845018.jpg', isDigital: true },
  { id: 47, title: 'My Hero Academia - Tập 15 (Digital)', author: 'Kohei Horikoshi', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: true },
  { id: 48, title: 'Tokyo Revengers - Tập 10 (Digital)', author: 'Ken Wakui', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: true },
  { id: 49, title: 'Boruto - Tập 10 (Digital)', author: 'Ukyō Kodachi', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: true },
  { id: 50, title: 'Black Clover - Tập 15 (Digital)', author: 'Yūki Tabata', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: true },
  { id: 51, title: 'Fairy Tail - Tập 30 (Digital)', author: 'Hiro Mashima', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: true },
  { id: 52, title: 'One Piece - Tập 50 (Digital)', author: 'Eiichiro Oda', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: true },
  { id: 53, title: 'SPY x FAMILY - Tập 5 (Digital)', author: 'Tatsuya Endo', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/p/spy-x-family---tap-9_bia_1_2.jpg', isDigital: true },
  { id: 54, title: 'Kaiju No. 8 - Tập 3 (Digital)', author: 'Naoya Matsumoto', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/k/a/kaiju-no.-8---tap-5---bia-thuong_1.jpg', isDigital: true },
  { id: 55, title: 'Blue Lock - Tập 5 (Digital)', author: 'Yusuke Nomura', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/b/l/blue-lock---tap-15---bia-ao---tang-kem-standee.jpg', isDigital: true },
  { id: 56, title: 'Doraemon Truyện Dài - Tập 5 (Digital)', author: 'Fujiko F Fujio', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---tap-1---bia-mem-tai-ban-2023.jpg', isDigital: true },
  { id: 57, title: 'Attack on Titan - Tập 20 (Digital)', author: 'Hajime Isayama', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36802.jpg', isDigital: true },
  { id: 58, title: 'Tokyo Revengers - Tập 5 (Digital)', author: 'Ken Wakui', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: true },
  { id: 59, title: 'Boruto - Tập 5 (Digital)', author: 'Ukyō Kodachi', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: true },
  { id: 60, title: 'Black Clover - Tập 5 (Digital)', author: 'Yūki Tabata', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: true },
];

// Mảng chung (Total 60)
export const comics: Comic[] = [...physicalComics, ...digitalComics];

export const getUniqueAuthors = (): string[] => {
    const authors = comics.map(c => c.author);
    return Array.from(new Set(authors));
};

export interface OrderItem {
    id: number;
    title: string;
    author: string;
    price: number;
    imageUrl: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    date: string;
    total: number;
    status: 'Hoàn thành' | 'Đang giao hàng' | 'Đã hủy' | 'Đang chờ';
    items: OrderItem[];
}

const ORDER_STORAGE_KEY = 'storyverse_orders';

export const loadOrders = (userId: string): Order[] => {
    try {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
        return allOrders.filter(order => order.userId === userId).sort((a, b) => b.id.localeCompare(a.id));
    } catch (e) {
        console.error("Failed to load orders from localStorage", e);
        return [];
    }
};

export const saveNewOrder = (order: Order): void => {
    try {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
        allOrders.push(order);
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(allOrders));
    } catch (e) {
        console.error("Failed to save new order to localStorage", e);
    }
};

export const getOrderById = (orderId: string): Order | undefined => {
    try {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
        return allOrders.find(order => order.id === orderId);
    } catch (e) {
        console.error("Failed to get order by ID from localStorage", e);
        return undefined;
    }
}