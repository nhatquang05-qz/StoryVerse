import React, { useEffect, useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import ReportManagementModal from './ReportManagementModal';
import ConfirmModal from '../popups/ConfirmModal';
import { FaExclamationTriangle, FaCommentDots, FaRegNewspaper, FaComments } from 'react-icons/fa';
import '../../assets/styles/ReportManagement.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const ReportManagement: React.FC = () => {
	const { showToast } = useToast();
	const [reports, setReports] = useState({ posts: [], comments: [], chatMessages: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'chat'>('chat');

	const [selectedReport, setSelectedReport] = useState<any>(null);
	const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

	const [confirmModal, setConfirmModal] = useState<{
		isOpen: boolean;
		action: 'delete' | 'ban' | 'dismiss' | null;
		title: string;
		message: string;
	}>({
		isOpen: false,
		action: null,
		title: '',
		message: '',
	});

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
			showToast('Lỗi tải danh sách báo cáo', 'error');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchReports();
	}, []);

	const triggerConfirmAction = (action: 'delete' | 'ban' | 'dismiss') => {
		let title = '';
		let message = '';

		switch (action) {
			case 'delete':
				title = 'Xác nhận xóa nội dung';
				message =
					'Bạn có chắc chắn muốn XÓA nội dung bị báo cáo này không? Hành động này không thể hoàn tác.';
				break;
			case 'ban':
				title = 'Xác nhận khóa tài khoản';
				message = `Bạn có chắc chắn muốn KHÓA tài khoản của người vi phạm (${selectedReport?.reportedName || 'người dùng'})?`;
				break;
			case 'dismiss':
				title = 'Xác nhận bỏ qua';
				message = 'Bạn có chắc chắn muốn bỏ qua báo cáo này (đánh dấu là không vi phạm)?';
				break;
		}

		setConfirmModal({
			isOpen: true,
			action,
			title,
			message,
		});
	};

	const handleExecuteAction = async () => {
		const { action } = confirmModal;
		if (!selectedReport || !action) return;

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
				showToast('Xử lý báo cáo thành công!', 'success');
				setIsDetailModalOpen(false);
				fetchReports();
			} else {
				showToast('Xử lý thất bại. Vui lòng thử lại.', 'error');
			}
		} catch (error) {
			showToast('Lỗi kết nối server', 'error');
		} finally {
			setConfirmModal({ ...confirmModal, isOpen: false });
		}
	};

	const getActiveList = () => {
		if (activeTab === 'posts') return reports.posts;
		if (activeTab === 'comments') return reports.comments;
		return reports.chatMessages;
	};

	const list = getActiveList();

	return (
		<div className="reportmgmt-container">
			<h2 className="reportmgmt-title">Quản Lý Báo Cáo Vi Phạm</h2>

			<div className="reportmgmt-tabs">
				<button
					className={`reportmgmt-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
					onClick={() => setActiveTab('chat')}
				>
					<FaComments /> Chat ({reports.chatMessages?.length || 0})
				</button>
				<button
					className={`reportmgmt-tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
					onClick={() => setActiveTab('posts')}
				>
					<FaRegNewspaper /> Bài viết ({reports.posts?.length || 0})
				</button>
				<button
					className={`reportmgmt-tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
					onClick={() => setActiveTab('comments')}
				>
					<FaCommentDots /> Bình luận ({reports.comments?.length || 0})
				</button>
			</div>

			{isLoading ? (
				<div className="reportmgmt-loading">Đang tải dữ liệu...</div>
			) : list.length === 0 ? (
				<div className="reportmgmt-empty">
					Không có báo cáo nào đang chờ xử lý trong mục này.
				</div>
			) : (
				<div className="reportmgmt-list-grid">
					{list.map((item: any) => (
						<div key={item.id} className="reportmgmt-card">
							<div>
								<div className="reportmgmt-card-header">
									<FaExclamationTriangle /> {item.reason}
								</div>
								<div className="reportmgmt-card-body">
									<div className="reportmgmt-info-row">
										<span className="reportmgmt-label">Người báo cáo:</span>
										<span>{item.reporterName}</span>
									</div>
									<div
										className="reportmgmt-info-row"
										style={{ flexDirection: 'column', gap: '4px' }}
									>
										<span className="reportmgmt-label">Nội dung bị báo:</span>
										<div className="reportmgmt-content-preview">
											"
											{item.targetContent
												? item.targetContent.substring(0, 80) +
													(item.targetContent.length > 80 ? '...' : '')
												: '(Hình ảnh/Sticker)'}
											"
										</div>
									</div>
								</div>
							</div>

							<div className="reportmgmt-card-footer">
								<span className="reportmgmt-date">
									{new Date(item.createdAt).toLocaleString('vi-VN')}
								</span>
								<button
									className="reportmgmt-btn-action"
									onClick={() => {
										setSelectedReport(item);
										setIsDetailModalOpen(true);
									}}
								>
									Xem & Xử lý
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{}
			{isDetailModalOpen && (
				<ReportManagementModal
					isOpen={isDetailModalOpen}
					onClose={() => setIsDetailModalOpen(false)}
					report={selectedReport}
					onDelete={() => triggerConfirmAction('delete')}
					onBan={() => triggerConfirmAction('ban')}
					onDismiss={() => triggerConfirmAction('dismiss')}
				/>
			)}

			{}
			<ConfirmModal
				isOpen={confirmModal.isOpen}
				title={confirmModal.title}
				message={confirmModal.message}
				confirmText="Xác nhận"
				cancelText="Hủy"
				onConfirm={handleExecuteAction}
				onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
				isDestructive={confirmModal.action === 'ban' || confirmModal.action === 'delete'}
			/>
		</div>
	);
};

export default ReportManagement;
