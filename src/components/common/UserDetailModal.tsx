import React, { useEffect, useState } from 'react';
import '../../assets/styles/UserDetail.css';
import { FiX, FiCalendar, FiActivity, FiMessageCircle } from 'react-icons/fi';
import { getEquivalentLevelTitle, getLevelColor } from '../../utils/authUtils';
import { useAuth } from '../../contexts/AuthContext';
import defaultAvatarImg from '../../assets/images/defaultAvatar.webp';

interface Comment {
	id: number;
	content: string;
	createdAt: string;
	comicTitle: string;
	comicCover: string;
	comicId: number;
	chapterNumber: number;
	chapterTitle?: string;
}

interface UserProfile {
	id: string;
	fullName: string;
	avatarUrl: string;
	level: number;
	levelSystem: string;
	joinDate: string;
	exp: number;
	recentComments: Comment[];
}

interface UserDetailModalProps {
	userId: string | null;
	isOpen: boolean;
	onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, isOpen, onClose }) => {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(false);
	useAuth();

	useEffect(() => {
		if (isOpen && userId) {
			fetchProfile(userId);
		} else {
			setProfile(null);
		}
	}, [isOpen, userId]);

	const getAvatarSrc = (url: string | null | undefined) => {
		if (!url || url === 'defaultAvatar.webp') return defaultAvatarImg;
		return url;
	};

	const fetchProfile = async (id: string) => {
		setLoading(true);
		try {
			const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
			const res = await fetch(`${apiUrl}/users/profile/${id}`);
			if (!res.ok) throw new Error('Failed to fetch profile');
			const data = await res.json();
			setProfile(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
				<button className="close-modal-btn" onClick={onClose}>
					<FiX />
				</button>

				{loading ? (
					<div className="loading-profile">Đang tải thông tin...</div>
				) : profile ? (
					<>
						<div className="profile-header-section">
							<div className="profile-avatar-large">
								<img src={getAvatarSrc(profile.avatarUrl)} alt={profile.fullName} />
							</div>
							<h2 className="profile-fullname">{profile.fullName}</h2>

							<div
								className="profile-level-badge"
								style={{
									backgroundColor: getLevelColor(profile.level),
									boxShadow: `0 0 10px ${getLevelColor(profile.level)}`,
								}}
							>
								{getEquivalentLevelTitle(profile.level, profile.levelSystem)}
							</div>

							<div className="profile-meta">
								<span>
									<FiActivity /> Cấp {profile.level}
								</span>
								<span>
									<FiCalendar /> Tham gia:{' '}
									{new Date(profile.joinDate).toLocaleDateString('vi-VN')}
								</span>
							</div>
						</div>

						<div className="profile-body-section">
							<h3>
								<FiMessageCircle
									style={{ marginRight: '8px', verticalAlign: 'middle' }}
								/>
								Bình luận gần đây
							</h3>
							{profile.recentComments && profile.recentComments.length > 0 ? (
								<div className="recent-reviews-list">
									{profile.recentComments.map((comment) => (
										<div key={comment.id} className="review-mini-item">
											<img
												src={comment.comicCover}
												alt="comic"
												className="review-comic-cover"
											/>
											<div className="review-content">
												<div className="review-comic-title">
													{comment.comicTitle}
													<span
														style={{
															fontSize: '0.8em',
															color: '#aaa',
															marginLeft: '5px',
														}}
													>
														- Chapter {comment.chapterNumber}
													</span>
												</div>

												<p className="review-text">"{comment.content}"</p>
												<span className="review-date">
													{new Date(comment.createdAt).toLocaleDateString(
														'vi-VN',
													)}
												</span>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="no-activity">
									Chưa có bình luận nào trong các chapter.
								</p>
							)}
						</div>
					</>
				) : (
					<div className="error-profile">Không tìm thấy thông tin người dùng.</div>
				)}
			</div>
		</div>
	);
};

export default UserDetailModal;
