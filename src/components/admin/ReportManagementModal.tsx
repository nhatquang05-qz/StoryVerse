import React from 'react';
import { FaTimes, FaTrash, FaBan, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import '../../assets/styles/ReportManagementModal.css';

interface ReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	report: any;
	onDelete: () => void;
	onBan: () => void;
	onDismiss: () => void;
}

const ReportManagementModal: React.FC<ReportModalProps> = ({
	isOpen,
	onClose,
	report,
	onDelete,
	onBan,
	onDismiss,
}) => {
	if (!isOpen || !report) return null;

	const isPost = report.targetType === 'POST';
	const isChat = report.targetType === 'CHAT_MESSAGE';

	const getTargetTitle = () => {
		if (isPost) return 'Bài viết';
		if (isChat) return 'Tin nhắn Chat';
		return 'Bình luận';
	};

	return (
		<div className="reportmodal-overlay">
			<div className="reportmodal-container">
				<div className="reportmodal-header">
					<h3 className="reportmodal-title">
						<FaExclamationTriangle />
						Xử lý vi phạm {getTargetTitle()}
					</h3>
					<button onClick={onClose} className="reportmodal-close-btn">
						<FaTimes />
					</button>
				</div>

				<div className="reportmodal-body">
					<div className="reportmodal-info-grid">
						<div className="reportmodal-info-box">
							<div className="reportmodal-label">Người báo cáo</div>
							<div className="reportmodal-value">
								{report.reporterName || 'Ẩn danh'}
							</div>
							<div className="reportmodal-reason">Lý do: {report.reason}</div>
						</div>
						<div className="reportmodal-info-box">
							<div className="reportmodal-label">Người bị báo cáo</div>
							<div className="reportmodal-value">
								{report.reportedUserName || 'Không xác định'}
							</div>
							<div className="reportmodal-id">ID: {report.reportedUserId}</div>
						</div>
					</div>

					<div className="reportmodal-content-section">
						<h4 className="reportmodal-content-title">Nội dung bị báo cáo:</h4>
						<div className="reportmodal-content-box">
							{report.targetContent ? (
								<p className="reportmodal-text">{report.targetContent}</p>
							) : (
								<p className="reportmodal-text-empty">
									(Không có nội dung văn bản)
								</p>
							)}

							{report.targetImage && (
								<div className="reportmodal-image-container">
									<img
										src={report.targetImage}
										alt="Violated content"
										className="reportmodal-image"
									/>
								</div>
							)}
							{report.targetSticker && (
								<div className="reportmodal-sticker-container">
									<img
										src={report.targetSticker}
										alt="Sticker"
										className="reportmodal-sticker"
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="reportmodal-footer">
					<button
						onClick={onDismiss}
						className="reportmodal-btn reportmodal-btn-dismiss"
						title="Đánh dấu không vi phạm"
					>
						<FaCheck /> Bỏ qua
					</button>
					<button
						onClick={onDelete}
						className="reportmodal-btn reportmodal-btn-delete"
						title="Xóa nội dung này"
					>
						<FaTrash /> Xoá nội dung
					</button>
					<button
						onClick={onBan}
						className="reportmodal-btn reportmodal-btn-ban"
						title="Xóa nội dung và Khóa tài khoản người dùng"
					>
						<FaBan /> Ban & Xoá
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReportManagementModal;
