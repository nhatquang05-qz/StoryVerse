import React, { useEffect, useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import ReportManagementModal from './ReportManagementModal';
import { FaExclamationTriangle, FaCommentDots, FaRegNewspaper, FaComments } from 'react-icons/fa';
import '../../assets/styles/ReportManagementModal.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ReportManagement: React.FC = () => {
	const { showNotification } = useNotification();
	const [reports, setReports] = useState({ posts: [], comments: [], chatMessages: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'chat'>('chat');
	const [selectedReport, setSelectedReport] = useState<any>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const fetchReports = async () => {
		setIsLoading(true);
		const token = localStorage.getItem('storyverse_token');
		try {
			const res = await fetch(`${API_BASE_URL}/reports/pending`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				const data = await res.json();
				setReports(data);
			}
		} catch (error) {
			console.error(error);
			showNotification('Lỗi tải danh sách báo cáo', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchReports();
	}, []);

	const handleAction = async (action: 'delete' | 'ban' | 'dismiss') => {
		if (!selectedReport) return;
		const token = localStorage.getItem('storyverse_token');
		let url = `${API_BASE_URL}/reports/${selectedReport.id}`;

		if (action === 'ban') url += '/ban';
		else if (action === 'dismiss') url += '/dismiss';

		try {
			const method = action === 'delete' ? 'DELETE' : 'POST';
			const res = await fetch(url, {
				method,
				headers: { Authorization: `Bearer ${token}` },
			});

			if (res.ok) {
				showNotification('Xử lý thành công!', 'success');
				setIsModalOpen(false);
				fetchReports();
			} else {
				showNotification('Xử lý thất bại', 'error');
			}
		} catch (error) {
			showNotification('Lỗi kết nối', 'error');
		}
	};

	const getActiveList = () => {
		if (activeTab === 'posts') return reports.posts;
		if (activeTab === 'comments') return reports.comments;
		return reports.chatMessages;
	};

	const list = getActiveList();

	return (
		<div className="admin-content-container">
			<h2 className="admin-page-title">Quản Lý Báo Cáo Vi Phạm</h2>

			{}
			<div
				className="report-tabs"
				style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}
			>
				<button
					className={`mgmt-btn ${activeTab === 'chat' ? 'add' : 'cancel'}`}
					onClick={() => setActiveTab('chat')}
				>
					<FaComments /> Chat ({reports.chatMessages?.length || 0})
				</button>
				<button
					className={`mgmt-btn ${activeTab === 'posts' ? 'add' : 'cancel'}`}
					onClick={() => setActiveTab('posts')}
				>
					<FaRegNewspaper /> Bài viết ({reports.posts?.length || 0})
				</button>
				<button
					className={`mgmt-btn ${activeTab === 'comments' ? 'add' : 'cancel'}`}
					onClick={() => setActiveTab('comments')}
				>
					<FaCommentDots /> Bình luận ({reports.comments?.length || 0})
				</button>
			</div>

			{}
			{isLoading ? (
				<div>Đang tải...</div>
			) : list.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
					Không có báo cáo nào đang chờ xử lý.
				</div>
			) : (
				<div className="report-list-grid" style={{ display: 'grid', gap: '1rem' }}>
					{list.map((item: any) => (
						<div
							key={item.id}
							className="report-card"
							style={{
								background: '#fff',
								padding: '1rem',
								borderRadius: '8px',
								border: '1px solid #ddd',
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
							}}
						>
							<div>
								<div style={{ fontWeight: 'bold', color: '#d32f2f' }}>
									<FaExclamationTriangle /> {item.reason}
								</div>
								<div style={{ fontSize: '0.9rem', color: '#555' }}>
									Người báo cáo: <strong>{item.reporterName}</strong>
								</div>
								<div style={{ fontSize: '0.9rem', marginTop: '4px' }}>
									Nội dung bị báo:{' '}
									<span style={{ fontStyle: 'italic' }}>
										"
										{item.targetContent
											? item.targetContent.substring(0, 50)
											: '(Hình ảnh/Sticker)'}
										..."
									</span>
								</div>
								<small style={{ color: '#888' }}>
									{new Date(item.createdAt).toLocaleString('vi-VN')}
								</small>
							</div>
							<button
								className="mgmt-btn edit"
								onClick={() => {
									setSelectedReport(item);
									setIsModalOpen(true);
								}}
							>
								Xem & Xử lý
							</button>
						</div>
					))}
				</div>
			)}

			{}
			<ReportManagementModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				report={selectedReport}
				onDelete={() => handleAction('delete')}
				onBan={() => handleAction('ban')}
				onDismiss={() => handleAction('dismiss')}
			/>
		</div>
	);
};

export default ReportManagement;
