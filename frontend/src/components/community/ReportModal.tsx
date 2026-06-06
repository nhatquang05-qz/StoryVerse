import React from 'react';
import '../../assets/styles/ReportModal.css';

interface ReportModalProps {
	isOpen: boolean;
	targetType: 'post' | 'comment' | 'chat_message' | undefined;
	reason: string;
	setReason: (val: string) => void;
	onClose: () => void;
	onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
	isOpen,
	targetType,
	reason,
	setReason,
	onClose,
	onSubmit,
}) => {
	if (!isOpen) return null;

	const getTitle = () => {
		if (targetType === 'post') return 'bài viết';
		if (targetType === 'comment') return 'bình luận';
		if (targetType === 'chat_message') return 'tin nhắn';
		return '';
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="report-modal" onClick={(e) => e.stopPropagation()}>
				<div className="report-title">Báo cáo {getTitle()}</div>
				<div className="report-options">
					{['Spam', 'Nội dung phản cảm', 'Quấy rối', 'Thông tin sai lệch', 'Khác'].map(
						(r) => (
							<label
								key={r}
								style={{ display: 'block', marginBottom: 10, cursor: 'pointer' }}
							>
								<input
									type="radio"
									name="reportReason"
									value={r}
									checked={reason === r}
									onChange={(e) => setReason(e.target.value)}
									style={{ marginRight: 8 }}
								/>
								{r}
							</label>
						),
					)}
				</div>
				<div className="modal-actions">
					<button className="btn-cancel" onClick={onClose}>
						Huỷ
					</button>
					<button className="btn-confirm" onClick={onSubmit}>
						Gửi
					</button>
				</div>
			</div>
		</div>
	);
};
export default ReportModal;
