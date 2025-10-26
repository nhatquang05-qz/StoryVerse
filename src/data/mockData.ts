export interface Comic {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string;
  isDigital: boolean;
  genres: string[];
  rating: number; 
  viewCount: number;
  unlockCoinPrice: number;
}

export const physicalComics: Comic[] = [
  { id: 1, title: 'Chú Thuật Hồi Chiến - Tập 10', author: 'Gege Akutami', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chu-thuat-hoi-chien---tap-10.jpg', isDigital: false, genres: ['Hành Động', 'Fantasy'], rating: 4.5, viewCount: 0, unlockCoinPrice: 0 },
  { id: 2, title: 'Thanh Gươm Diệt Quỷ - Tập 23', author: 'Koyoharu Gotouge', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36793.jpg', isDigital: false, genres: ['Hành Động', 'Fantasy'], rating: 4.8, viewCount: 0, unlockCoinPrice: 0 },
  { id: 3, title: 'Học Viện Siêu Anh Hùng - Tập 35', author: 'Kohei Horikoshi', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hoc-vien-sieu-anh-hung---tap-35---bia-ao.jpg', isDigital: false, genres: ['Hành Động', 'Siêu Anh Hùng'], rating: 4.2, viewCount: 0, unlockCoinPrice: 0 },
  { id: 4, title: 'One Piece - Tập 104', author: 'Eiichiro Oda', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: false, genres: ['Phiêu Lưu', 'Hành Động'], rating: 4.9, viewCount: 0, unlockCoinPrice: 0 },
  { id: 5, title: 'SPY x FAMILY - Tập 9', author: 'Tatsuya Endo', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/p/spy-x-family---tap-9_bia_1_2.jpg', isDigital: false, genres: ['Hài Hước', 'Tình Cảm'], rating: 4.6, viewCount: 0, unlockCoinPrice: 0 },
  { id: 6, title: 'Kaiju No. 8 - Tập 5', author: 'Naoya Matsumoto', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/k/a/kaiju-no.-8---tap-5---bia-thuong_1.jpg', isDigital: false, genres: ['Khoa Học Viễn Tưởng', 'Hành Động'], rating: 4.1, viewCount: 0, unlockCoinPrice: 0 },
  { id: 7, title: 'Blue Lock - Tập 15', author: 'Yusuke Nomura', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/b/l/blue-lock---tap-15---bia-ao---tang-kem-standee.jpg', isDigital: false, genres: ['Thể Thao', 'Hành Động'], rating: 4.3, viewCount: 0, unlockCoinPrice: 0 },
  { id: 8, title: 'Doraemon Truyện Dài - Tập 1', author: 'Fujiko F Fujio', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---tap-1---bia-mem-tai-ban-2023.jpg', isDigital: false, genres: ['Hài Hước', 'Phiêu Lưu'], rating: 4.7, viewCount: 0, unlockCoinPrice: 0 },
  { id: 9, title: 'Attack on Titan - Tập 34', author: 'Hajime Isayama', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36802.jpg', isDigital: false, genres: ['Dark Fantasy', 'Hành Động'], rating: 4.9, viewCount: 0, unlockCoinPrice: 0 },
  { id: 10, title: 'Tokyo Revengers - Tập 20', author: 'Ken Wakui', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: false, genres: ['Xuyên Không', 'Hành Động'], rating: 3.9, viewCount: 0, unlockCoinPrice: 0 },
  { id: 11, title: 'Boruto - Tập 18', author: 'Ukyō Kodachi', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: false, genres: ['Hành Động', 'Fantasy'], rating: 4.2, viewCount: 0, unlockCoinPrice: 0 },
  { id: 12, title: 'Black Clover - Tập 30', author: 'Yūki Tabata', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: false, genres: ['Fantasy', 'Hành Động'], rating: 4.4, viewCount: 0, unlockCoinPrice: 0 },
  { id: 13, title: 'Fairy Tail - Tập 63', author: 'Hiro Mashima', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: false, genres: ['Fantasy', 'Phiêu Lưu'], rating: 4.0, viewCount: 0, unlockCoinPrice: 0 },
  { id: 14, title: 'Haikyuu!! - Tập 45', author: 'Haruichi Furudate', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847951.jpg', isDigital: false, genres: ['Thể Thao'], rating: 4.6, viewCount: 0, unlockCoinPrice: 0 },
  { id: 15, title: 'Dr. STONE - Tập 26', author: 'Riichiro Inagaki', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: false, genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu'], rating: 4.5, viewCount: 0, unlockCoinPrice: 0 },
  { id: 16, title: 'Conan - Tập 101', author: 'Gosho Aoyama', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: false, genres: ['Trinh Thám'], rating: 4.1, viewCount: 0, unlockCoinPrice: 0 },
  { id: 17, title: 'Jujutsu Kaisen - Tập 15', author: 'Gege Akutami', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chuthuathoichien_tap15.jpg', isDigital: false, genres: ['Hành Động', 'Fantasy'], rating: 4.7, viewCount: 0, unlockCoinPrice: 0 },
  { id: 18, title: 'Chainsaw Man - Tập 11', author: 'Tatsuki Fujimoto', price: 38000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: false, genres: ['Dark Fantasy', 'Hành Động'], rating: 4.5, viewCount: 0, unlockCoinPrice: 0 },
  { id: 19, title: 'Fullmetal Alchemist - Tập 27', author: 'Hiromu Arakawa', price: 45000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244845018.jpg', isDigital: false, genres: ['Fantasy', 'Phiêu Lưu'], rating: 4.8, viewCount: 0, unlockCoinPrice: 0 },
  { id: 20, title: 'My Hero Academia - Tập 30', author: 'Kohei Horikoshi', price: 32000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: false, genres: ['Hành Động', 'Siêu Anh Hùng'], rating: 4.0, viewCount: 0, unlockCoinPrice: 0 },
  { id: 21, title: 'One Piece - Tập 105', author: 'Eiichiro Oda', price: 25000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: false, genres: ['Phiêu Lưu', 'Hành Động'], rating: 4.9, viewCount: 0, unlockCoinPrice: 0 },
  { id: 22, title: 'Thám Tử Lừng Danh Conan - Tập 102', author: 'Gosho Aoyama', price: 22000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: false, genres: ['Trinh Thám'], rating: 4.3, viewCount: 0, unlockCoinPrice: 0 },
  { id: 23, title: 'Naruto - Tập 72', author: 'Masashi Kishimoto', price: 30000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: false, genres: ['Hành Động', 'Fantasy'], rating: 4.7, viewCount: 0, unlockCoinPrice: 0 },
  { id: 24, title: 'Dragon Ball Super - Tập 18', author: 'Toyotarou', price: 28000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: false, genres: ['Hành Động', 'Khoa Học Viễn Tưởng'], rating: 4.6, viewCount: 0, unlockCoinPrice: 0 },
  { id: 25, title: 'Vinland Saga - Tập 15', author: 'Makoto Yukimura', price: 60000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/v/i/vinland-saga-tap-10.jpg', isDigital: false, genres: ['Sử Thi', 'Phiêu Lưu'], rating: 4.8, viewCount: 0, unlockCoinPrice: 0 },
  { id: 26, title: 'Slam Dunk - Tập 20', author: 'Takehiko Inoue', price: 50000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/l/slam-dunk-tap-31.jpg', isDigital: false, genres: ['Thể Thao'], rating: 4.9, viewCount: 0, unlockCoinPrice: 0 },
  { id: 27, title: 'Bleach - Tập 74', author: 'Tite Kubo', price: 35000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: false, genres: ['Fantasy', 'Hành Động'], rating: 4.2, viewCount: 0, unlockCoinPrice: 0 },
  { id: 28, title: 'Gintama - Tập 77', author: 'Hideaki Sorachi', price: 38000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: false, genres: ['Hài Hước', 'Khoa Học Viễn Tưởng'], rating: 4.1, viewCount: 0, unlockCoinPrice: 0 },
  { id: 29, title: 'Hajime no Ippo - Tập 135', author: 'George Morikawa', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: false, genres: ['Thể Thao', 'Hành Động'], rating: 4.4, viewCount: 0, unlockCoinPrice: 0 },
  { id: 30, title: 'Kingdom - Tập 61', author: 'Yasuhisa Hara', price: 40000, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847128.jpg', isDigital: false, genres: ['Sử Thi', 'Hành Động'], rating: 4.1, viewCount: 0, unlockCoinPrice: 0 },
];

export const digitalComics: Comic[] = [
  { id: 31, title: 'One Punch Man - Tập 24 (Digital)', author: 'Yusuke Murata', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849610.jpg', isDigital: true, genres: ['Hài Hước', 'Siêu Anh Hùng'], rating: 4.7, viewCount: 150000, unlockCoinPrice: 0 },
  { id: 32, title: 'Demon Slayer - Tập 15 (Digital)', author: 'Koyoharu Gotouge', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849306.jpg', isDigital: true, genres: ['Hành Động', 'Fantasy'], rating: 4.9, viewCount: 220000, unlockCoinPrice: 150 },
  { id: 33, title: 'Fire Force - Tập 25 (Digital)', author: 'Atsushi Ohkubo', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/f/i/fireforce_tap25.jpg', isDigital: true, genres: ['Khoa Học Viễn Tưởng', 'Hành Động'], rating: 4.2, viewCount: 62100, unlockCoinPrice: 100 },
  { id: 34, title: 'The Promised Neverland - Tập 20 (Digital)', author: 'Kaiu Shirai', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848521.jpg', isDigital: true, genres: ['Huyền Bí', 'Kinh Dị'], rating: 4.5, viewCount: 88000, unlockCoinPrice: 80 },
  { id: 35, title: 'Jojo Bizarre Adventure - Tập 5 (Digital)', author: 'Hirohiko Araki', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/j/o/jojo_s-bizarre-adventure-tap-5.jpg', isDigital: true, genres: ['Hành Động', 'Fantasy'], rating: 4.8, viewCount: 120000, unlockCoinPrice: 150 },
  { id: 36, title: 'Hunter x Hunter - Tập 36 (Digital)', author: 'Yoshihiro Togashi', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847425.jpg', isDigital: true, genres: ['Phiêu Lưu', 'Fantasy'], rating: 4.6, viewCount: 95000, unlockCoinPrice: 0 },
  { id: 37, title: 'Vinland Saga - Tập 10 (Digital)', author: 'Makoto Yukimura', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/v/i/vinland-saga-tap-10.jpg', isDigital: true, genres: ['Sử Thi', 'Phiêu Lưu'], rating: 4.9, viewCount: 180000, unlockCoinPrice: 200 },
  { id: 38, title: 'Kingdom - Tập 60 (Digital)', author: 'Yasuhisa Hara', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847128.jpg', isDigital: true, genres: ['Sử Thi', 'Hành Động'], rating: 4.1, viewCount: 45000, unlockCoinPrice: 50 },
  { id: 39, title: 'Slam Dunk - Tập 31 (Digital)', author: 'Takehiko Inoue', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/l/slam-dunk-tap-31.jpg', isDigital: true, genres: ['Thể Thao'], rating: 4.9, viewCount: 110000, unlockCoinPrice: 0 },
  { id: 40, title: 'Death Note - Tập 12 (Digital)', author: 'Tsugumi Ohba', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/e/death-note-tap-12.jpg', isDigital: true, genres: ['Trinh Thám', 'Huyền Bí'], rating: 4.4, viewCount: 75000, unlockCoinPrice: 100 },
  { id: 41, title: 'Haikyuu!! - Tập 25 (Digital)', author: 'Haruichi Furudate', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847951.jpg', isDigital: true, genres: ['Thể Thao'], rating: 4.7, viewCount: 105000, unlockCoinPrice: 120 },
  { id: 42, title: 'Dr. STONE - Tập 10 (Digital)', author: 'Riichiro Inagaki', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/r/dr_stone_26.jpg', isDigital: true, genres: ['Khoa Học Viễn Tưởng', 'Phiêu Lưu'], rating: 4.5, viewCount: 82000, unlockCoinPrice: 90 },
  { id: 43, title: 'Conan - Tập 90 (Digital)', author: 'Gosho Aoyama', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244847012.jpg', isDigital: true, genres: ['Trinh Thám'], rating: 4.0, viewCount: 65000, unlockCoinPrice: 0 },
  { id: 44, title: 'Jujutsu Kaisen - Tập 10 (Digital)', author: 'Gege Akutami', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/c/h/chuthuathoichien_tap15.jpg', isDigital: true, genres: ['Hành Động', 'Fantasy'], rating: 4.8, viewCount: 170000, unlockCoinPrice: 130 },
  { id: 45, title: 'Chainsaw Man - Tập 5 (Digital)', author: 'Tatsuki Fujimoto', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244846015.jpg', isDigital: true, genres: ['Dark Fantasy', 'Hành Động'], rating: 4.6, viewCount: 140000, unlockCoinPrice: 100 },
  { id: 46, title: 'Fullmetal Alchemist - Tập 10 (Digital)', author: 'Hiromu Arakawa', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244845018.jpg', isDigital: true, genres: ['Fantasy', 'Phiêu Lưu'], rating: 4.7, viewCount: 90000, unlockCoinPrice: 150 },
  { id: 47, title: 'My Hero Academia - Tập 15 (Digital)', author: 'Kohei Horikoshi', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/h/o/hocviensieuanhhung_tap30.jpg', isDigital: true, genres: ['Hành Động', 'Siêu Anh Hùng'], rating: 4.3, viewCount: 78000, unlockCoinPrice: 0 },
  { id: 48, title: 'Tokyo Revengers - Tập 10 (Digital)', author: 'Ken Wakui', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: true, genres: ['Xuyên Không', 'Hành Động'], rating: 3.8, viewCount: 55000, unlockCoinPrice: 70 },
  { id: 49, title: 'Boruto - Tập 10 (Digital)', author: 'Ukyō Kodachi', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: true, genres: ['Hành Động', 'Fantasy'], rating: 4.1, viewCount: 42000, unlockCoinPrice: 90 },
  { id: 50, title: 'Black Clover - Tập 15 (Digital)', author: 'Yūki Tabata', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: true, genres: ['Fantasy', 'Hành Động'], rating: 4.3, viewCount: 68000, unlockCoinPrice: 100 },
  { id: 51, title: 'Fairy Tail - Tập 30 (Digital)', author: 'Hiro Mashima', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848033.jpg', isDigital: true, genres: ['Fantasy', 'Phiêu Lưu'], rating: 4.0, viewCount: 59000, unlockCoinPrice: 80 },
  { id: 52, title: 'One Piece - Tập 50 (Digital)', author: 'Eiichiro Oda', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/o/n/one-piece---tap-104_bia_1_2.jpg', isDigital: true, genres: ['Hành Động', 'Phiêu Lưu'], rating: 4.9, viewCount: 250000, unlockCoinPrice: 0 },
  { id: 53, title: 'SPY x FAMILY - Tập 5 (Digital)', author: 'Tatsuya Endo', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/s/p/spy-x-family---tap-9_bia_1_2.jpg', isDigital: true, genres: ['Hài Hước', 'Tình Cảm'], rating: 4.6, viewCount: 115000, unlockCoinPrice: 110 },
  { id: 54, title: 'Kaiju No. 8 - Tập 3 (Digital)', author: 'Naoya Matsumoto', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/k/a/kaiju-no.-8---tap-5---bia-thuong_1.jpg', isDigital: true, genres: ['Khoa Học Viễn Tưởng', 'Hành Động'], rating: 4.1, viewCount: 52000, unlockCoinPrice: 90 },
  { id: 55, title: 'Blue Lock - Tập 5 (Digital)', author: 'Yusuke Nomura', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/b/l/blue-lock---tap-15---bia-ao---tang-kem-standee.jpg', isDigital: true, genres: ['Thể Thao', 'Hành Động'], rating: 4.3, viewCount: 71000, unlockCoinPrice: 120 },
  { id: 56, title: 'Doraemon Truyện Dài - Tập 5 (Digital)', author: 'Fujiko F Fujio', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/d/o/doraemon-truyen-dai---tap-1---bia-mem-tai-ban-2023.jpg', isDigital: true, genres: ['Hài Hước', 'Phiêu Lưu'], rating: 4.7, viewCount: 88000, unlockCoinPrice: 0 },
  { id: 57, title: 'Attack on Titan - Tập 20 (Digital)', author: 'Hajime Isayama', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_195509_1_36802.jpg', isDigital: true, genres: ['Hành Động', 'Dark Fantasy'], rating: 4.9, viewCount: 190000, unlockCoinPrice: 180 },
  { id: 58, title: 'Tokyo Revengers - Tập 5 (Digital)', author: 'Ken Wakui', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244849313.jpg', isDigital: true, genres: ['Xuyên Không', 'Hành Động'], rating: 3.9, viewCount: 58000, unlockCoinPrice: 70 },
  { id: 59, title: 'Boruto - Tập 5 (Digital)', author: 'Ukyō Kodachi', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/i/m/image_224520.jpg', isDigital: true, genres: ['Hành Động', 'Fantasy'], rating: 4.1, viewCount: 42000, unlockCoinPrice: 90 },
  { id: 60, title: 'Black Clover - Tập 5 (Digital)', author: 'Yūki Tabata', price: 0, imageUrl: 'https://cdn0.fahasa.com/media/catalog/product/8/9/8935244848910.jpg', isDigital: true, genres: ['Fantasy', 'Hành Động'], rating: 4.0, viewCount: 45000, unlockCoinPrice: 80 },
];

export const comics: Comic[] = [...physicalComics, ...digitalComics];

export const getUniqueAuthors = (): string[] => {
    const authors = comics.map(c => c.author);
    return Array.from(new Set(authors));
};

export const getUniqueGenres = (): string[] => {
    const allGenres = comics.flatMap(c => c.genres);
    const genreSet = new Set(allGenres);
    return Array.from(genreSet).sort();
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

export interface Review {
  id: number;
  comicId: number; 
  author: string;
  rating: number;
  date: string;
  comment: string;
}

const ORDER_STORAGE_KEY = 'storyverse_orders';
const REVIEW_STORAGE_KEY = 'storyverse_reviews';

export const loadOrders = (userId: string): Order[] => {
    try {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
        return allOrders.filter(order => order.userId === userId).sort((a, b) => b.id.localeCompare(a.id));
    } catch (e) {
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
    }
};

export const getOrderById = (orderId: string): Order | undefined => {
    try {
        const storedOrders = localStorage.getItem(ORDER_STORAGE_KEY);
        const allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];
        return allOrders.find(order => order.id === orderId);
    } catch (e) {
        return undefined;
    }
}

export const loadReviews = (comicId: number): Review[] => {
    try {
        const storedReviews = localStorage.getItem(REVIEW_STORAGE_KEY);
        const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
        return allReviews.filter(r => r.comicId === comicId).sort((a, b) => b.id - a.id);
    } catch (e) {
        return [];
    }
};

export const saveNewReview = (review: Review): void => {
    try {
        const storedReviews = localStorage.getItem(REVIEW_STORAGE_KEY);
        const allReviews: Review[] = storedReviews ? JSON.parse(storedReviews) : [];
        allReviews.push(review);
        localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(allReviews));
    } catch (e) {
    }
};

export const trendingComics: Comic[] = [...physicalComics]
    .sort((a, b) => b.price - a.price) 
    .slice(0, 12);

export const newReleasesComics: Comic[] = [...comics]
    .sort((a, b) => b.id - a.id)
    .slice(0, 15);
    
export const recommendedDigitalComics: Comic[] = digitalComics
    .filter(c => c.genres.includes('Fantasy'))
    .slice(0, 10);
    
interface FeaturedTag {
  name: string;
  count: number;
  imageUrl: string; 
  color: string; 
  link: string; 
}

const featuredTagsData: FeaturedTag[] = [
  { name: 'ACTION', count: 5379, imageUrl: '/path/to/action-image.png', color: '#4A90E2', link: '/genres/action' },
  { name: 'ROMANCE', count: 5364, imageUrl: '/path/to/romance-image.png', color: '#D95C5C', link: '/genres/romance' },
  { name: 'COMEDY', count: 5078, imageUrl: '/path/to/comedy-image.png', color: '#50E3C2', link: '/genres/comedy' },
  { name: 'FANTASY', count: 3463, imageUrl: '/path/to/fantasy-image.png', color: '#AE81FF', link: '/genres/fantasy' },
];