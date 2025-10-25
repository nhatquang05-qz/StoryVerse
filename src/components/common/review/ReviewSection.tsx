import React, { useState, useEffect, useCallback } from 'react';
import { FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { saveNewReview, loadReviews, type Review } from '../../../data/mockData';
import './ReviewSection.css';

interface ReviewSectionProps {
    comicId: number;
    comicTitle: string;
}

const MIN_COMMENT_LENGTH = 3; 

const ReviewSection: React.FC<ReviewSectionProps> = ({ comicId, comicTitle }) => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newComment, setNewComment] = useState('');
    const [newRating, setNewRating] = useState(5);
    
    useEffect(() => {
        const storedReviews = loadReviews(comicId);
        setReviews(storedReviews);
    }, [comicId]);


    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    const roundedRating = Math.round(averageRating * 2) / 2;

    const renderStars = useCallback((rating: number) => {
        return Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            return (
                <FiStar
                    key={index}
                    className="star-icon"
                    fill={starValue <= rating ? '#ffc107' : 'none'}
                    stroke={starValue <= rating ? '#ffc107' : '#e0e0e0'}
                />
            );
        });
    }, []);

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            showNotification('Vui lòng đăng nhập để gửi đánh giá.', 'warning');
            return;
        }
        if (newComment.trim().length < MIN_COMMENT_LENGTH) {
            showNotification(`Bình luận phải có ít nhất ${MIN_COMMENT_LENGTH} ký tự.`, 'warning');
            return;
        }

        const newReview: Review = {
            id: Date.now(),
            comicId: comicId,
            author: currentUser.fullName || currentUser.email.split('@')[0] || 'Khách Hàng',
            rating: newRating,
            date: new Date().toLocaleDateString('vi-VN'),
            comment: newComment.trim(),
        };

        saveNewReview(newReview);
        
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        setNewComment('');
        setNewRating(5);
        showNotification('Đánh giá của bạn đã được gửi thành công!', 'success');
    };

    return (
        <div className="review-section">
            <h2>Đánh giá về "{comicTitle}" ({reviews.length})</h2>

            <div className="rating-summary">
                <div className="average-rating">{roundedRating.toFixed(1)}</div>
                <div>
                    <div className="star-rating">
                        {renderStars(roundedRating)}
                    </div>
                    <p>{reviews.length} đánh giá</p>
                </div>
            </div>

            <div className="review-list">
                {reviews.map((review) => (
                    <div key={review.id} className="review-item">
                        <div className="review-header">
                            <span className="review-author">{review.author}</span>
                            <span className="review-date">{review.date}</span>
                        </div>
                        <div className="star-rating">{renderStars(review.rating)}</div>
                        <p className="review-text">{review.comment}</p>
                    </div>
                ))}
            </div>

            <div className="review-form-container">
                <h3>Gửi đánh giá của bạn</h3>
                {currentUser ? (
                    <form onSubmit={handleSubmitReview}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
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
                                            stroke={starValue <= ratingToRender ? '#ffc107' : '#e0e0e0'}
                                            onClick={() => setNewRating(starValue)}
                                            style={{ cursor: 'pointer', margin: '0 0.1rem' }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                        <textarea className='comment-box'
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
                    <p>Vui lòng <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>đăng nhập</Link> để gửi đánh giá.</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;