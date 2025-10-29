// src/types/comicTypes.ts

export interface Genre {
    id: number;
    name: string;
}

export interface ChapterSummary {
    id: number;
    // chapterNumber có thể là số hoặc string tùy theo API trả về
    chapterNumber: number | string;
    title?: string;
    price: number;
    createdAt: string;
    // Thêm trường 'isPurchased' nếu API trả về trạng thái mua
    isPurchased?: boolean;
}

export interface ComicSummary {
    id: number;
    title: string;
    author?: string;
    coverImageUrl: string;
    status: 'Ongoing' | 'Completed' | 'Dropped';
    isDigital: boolean;
    price: number;
    viewCount: number;
    updatedAt: string;
    genres?: string; // Hoặc Genre[]
}

export interface ComicDetail extends ComicSummary {
    description?: string;
    chapters: ChapterSummary[];
    // averageRating?: number;
    // totalReviews?: number;
}

export interface ChapterContent {
    chapterId: number;
    comicId: number;
    chapterNumber: number | string;
    contentUrls: string[]; // Mảng URL ảnh
}