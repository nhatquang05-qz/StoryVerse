import React, { useState, useEffect, useCallback } from 'react';
import { FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { type Review } from '../../types/comicTypes';
import '../../assets/styles/ReviewSection.css';

interface ReviewSectionProps {
	comicId: number;
	comicTitle: string;
}

const MIN_COMMENT_LENGTH = 3;
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TOKEN_STORAGE_KEY = 'storyverse_token';

const ReviewSection: React.FC<ReviewSectionProps> = ({ comicId, comicTitle }) => {
	const { currentUser } = useAuth();
	const { showNotification } = useNotification();
	const [reviews, setReviews] = useState<Review[]>([]);
	const [newComment, setNewComment] = useState('');
	const [newRating, setNewRating] = useState(5);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const response = await fetch(`${API_URL}/comics/${comicId}/reviews`);
				if (!response.ok) {
					throw new Error('Failed to fetch reviews');
				}
				const data: Review[] = await response.json();
				setReviews(data);
			} catch (error) {
				console.error('Error loading reviews:', error);
				setReviews([]);
			}
		};

		fetchReviews();
	}, [comicId]);

	const averageRating =
		reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
	const roundedRating = Math.round(averageRating * 10) / 10;

	const renderStars = useCallback((rating: number) => {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating - fullStars >= 0.5;

		return Array.from({ length: 5 }, (_, index) => {
			const starValue = index + 1;
			let fillStyle: 'full' | 'half' | 'none' = 'none';

			if (starValue <= fullStars) {
				fillStyle = 'full';
			} else if (starValue === fullStars + 1 && hasHalfStar) {
				fillStyle = 'half';
			}

			return (
				<FiStar
					key={index}
					className="star-icon"
					fill={
						fillStyle === 'full'
							? '#ffc107'
							: fillStyle === 'half'
								? `url(#half-fill-summary)`
								: 'none'
					}
					stroke={fillStyle === 'full' ? '#ffc107' : '#e0e0e0'}
				/>
			);
		});
	}, []);

	const halfStarGradient = (
		<svg width="0" height="0" style={{ position: 'absolute' }}>
			<linearGradient id="half-fill-summary" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="50%" style={{ stopColor: '#ffc107', stopOpacity: 1 }} />
				<stop offset="50%" style={{ stopColor: 'transparent', stopOpacity: 1 }} />
			</linearGradient>
		</svg>
	);

	const handleSubmitReview = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!currentUser) {
			showNotification('Vui lòng đăng nhập để gửi đánh giá.', 'warning');
			return;
		}
		if (newComment.trim().length < MIN_COMMENT_LENGTH) {
			showNotification(`Bình luận phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự.`, 'warning');
			return;
		}

		const token = localStorage.getItem(TOKEN_STORAGE_KEY);
		if (!token) {
			showNotification('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', 'error');
			return;
		}

		try {
			const response = await fetch(`${API_URL}/comics/${comicId}/reviews`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					rating: newRating,
					comment: newComment.trim(),
				}),
			});

			const newReviewData = await response.json();

			if (!response.ok) {
				throw new Error(newReviewData.error || 'Không thể gửi đánh giá');
			}

			setReviews((prevReviews) => {
				const otherReviews = prevReviews.filter((r) => r.userId !== currentUser.id);
				return [newReviewData, ...otherReviews];
			});

			setNewComment('');
			setNewRating(5);
			showNotification('Đánh giá của bạn đã được gửi thành công!', 'success');
		} catch (error: any) {
			console.error('Lỗi gửi đánh giá:', error);
			showNotification(error.message || 'Lỗi khi gửi đánh giá.', 'error');
		}
	};

	return (
		<div className="review-section">
			{halfStarGradient}
			<h2>
				Đánh giá về "{comicTitle}" ({reviews.length})
			</h2>

			<div className="rating-summary">
				<div className="average-rating">{roundedRating.toFixed(1)}</div>
				<div>
					<div className="star-rating">{renderStars(roundedRating)}</div>
					<p>{reviews.length} đánh giá</p>
				</div>
			</div>

			<div className="review-list">
				{reviews.map((review) => (
					<div key={review.id} className="review-item">
						<div className="review-header">
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
								<img
									src={review.avatarUrl || 'https://via.placeholder.com/30'}
									alt="Avatar"
									style={{
										width: '30px',
										height: '30px',
										borderRadius: '50%',
										objectFit: 'cover',
									}}
								/>
								<span className="review-author">{review.fullName}</span>
							</div>
							<span className="review-date">
								{new Date(review.createdAt).toLocaleDateString('vi-VN')}
							</span>
						</div>
						<div className="star-rating" style={{ fontSize: '1rem' }}>
							{renderStars(review.rating)}
						</div>
						<p className="review-text">{review.comment}</p>
					</div>
				))}
			</div>

			<div className="review-form-container">
				<h3>Gửi đánh giá của bạn</h3>
				{currentUser ? (
					<form onSubmit={handleSubmitReview}>
						<div
							style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}
						>
							<span style={{ marginRight: '1rem', fontWeight: 500 }}>Chấm điểm:</span>
							<div className="star-rating">
								{Array.from({ length: 5 }, (_, index) => {
									const starValue = index + 1;
									const ratingToRender = newRating;
									return (
										<FiStar
											key={index}
											className="star-icon"
											fill={starValue <= ratingToRender ? '#ffc107' : 'none'}
											stroke={
												starValue <= ratingToRender ? '#ffc107' : '#e0e0e0'
											}
											onClick={() => setNewRating(starValue)}
											style={{ cursor: 'pointer', margin: '0 0.1rem' }}
										/>
									);
								})}
							</div>
						</div>
						<textarea
							className="comment-box"
							placeholder="Viết bình luận của bạn về sản phẩm..."
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							required
						/>
						<button
							type="submit"
							className="submit-review-btn"
							disabled={newComment.trim().length < MIN_COMMENT_LENGTH}
						>
							Gửi Đánh Giá
						</button>
					</form>
				) : (
					<p>
						Vui lòng{' '}
						<Link
							to="/login"
							style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}
						>
							đăng nhập
						</Link>{' '}
						để gửi đánh giá.
					</p>
				)}
			</div>
		</div>
	);
};

export default ReviewSection;
