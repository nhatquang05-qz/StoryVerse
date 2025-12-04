export interface Genre {
	id: number;
	name: string;
}

export interface ChapterSummary {
	id: number;
	chapterNumber: number | string;
	title?: string;
	price: number;
	createdAt: string;
	viewCount?: number;
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
	flashSalePrice?: number | null;
	views: number;
	updatedAt: string;
	genres?: Genre[];
	averageRating: number;
	totalReviews: number;
	soldCount?: number;
	flashSaleSold?: number | null;
	flashSaleLimit?: number | null;
}

export interface ComicDetail extends ComicSummary {
	description?: string;
	chapters: ChapterSummary[];
	uploaderId?: string;
}

export interface ChapterContent {
	id: number;
	comic_id: number;
	chapterNumber: number | string;
	title?: string;
	price: number;
	contentUrls: string[];
	createdAt: string;
}

export interface Review {
	id: number;
	userId: string;
	comicId: number;
	rating: number;
	comment: string;
	createdAt: string;
	fullName: string;
	avatarUrl: string;
}
