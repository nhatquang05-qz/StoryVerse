export interface Comment {
	id: number;
	postId: number;
	userId: number;
	userName: string;
	avatar: string;
	content: string;
	imageUrl?: string;
	stickerUrl?: string;
	parentId?: number | null;
	createdAt: string;
	likeCount: number;
	isLiked: boolean;
}

export interface Post {
	id: number;
	userId: number;
	userName: string;
	avatar: string;
	content: string;
	imageUrl?: string;
	createdAt: string;
	likeCount: number;
	commentCount: number;
	isLiked: boolean;
	comments?: Comment[];
}
