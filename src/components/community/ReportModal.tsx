import React from 'react';
import '../../assets/styles/ReportModal.css';

interface ReportModalProps {
    isOpen: boolean;
    targetType: 'post' | 'comment' | undefined;
    reason: string;
    setReason: (val: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, targetType, reason, setReason, onClose, onSubmit }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={e => e.stopPropagation()}>
                <div className="report-title">Báo cáo {targetType === 'post' ? 'bài viết' : 'bình luận'}</div>
                <div className="report-options">
                    {['Spam', 'Nội dung phản cảm', 'Quấy rối', 'Thông tin sai lệch', 'Khác'].map(r => (
                        <label key={r} style={{display:'block', marginBottom: 10, cursor:'pointer'}}>
                            <input type="radio" name="reportReason" value={r} checked={reason === r} onChange={(e) => setReason(e.target.value)} style={{marginRight: 8}}/>{r}
                        </label>
                    ))}
                </div>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Huỷ</button>
                    <button className="btn-confirm" onClick={onSubmit}>Gửi</button>
                </div>
            </div>
        </div>
    );
};
export default ReportModal;