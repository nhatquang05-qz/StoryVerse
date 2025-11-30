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

const ReportManagementModal: React.FC<ReportModalProps> = ({ isOpen, onClose, report, onDelete, onBan, onDismiss }) => {
    if (!isOpen || !report) return null;

    const isPost = report.targetType === 'POST';

    return (
        <div className="report-modal-overlay">
            <div className="report-modal-container">
                <div className="report-modal-header">
                    <h3 className="report-modal-title">
                        <FaExclamationTriangle />
                        Xử lý vi phạm {isPost ? 'Bài viết' : 'Bình luận'}
                    </h3>
                    <button onClick={onClose} className="report-modal-close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="report-modal-body">
                    <div className="report-info-grid">
                        <div className="report-info-box">
                            <div className="report-label">Người báo cáo:</div>
                            <div className="report-value">{report.reporterName || 'Ẩn danh'}</div>
                            <div className="report-reason">Lý do: {report.reason}</div>
                        </div>
                        <div className="report-info-box">
                            <div className="report-label">Người bị báo cáo:</div>
                            <div className="report-value">{report.reportedUserName || 'Không xác định'}</div>
                            <div className="report-id">ID: {report.reportedUserId}</div>
                        </div>
                    </div>

                    {/* Nội dung vi phạm */}
                    <div className="report-content-section">
                        <h4 className="report-content-title">Nội dung bị báo cáo:</h4>
                        <div className="report-content-box">
                            {report.targetContent ? (
                                <p className="report-text">{report.targetContent}</p>
                            ) : (
                                <p className="report-text-empty">(Không có nội dung văn bản)</p>
                            )}
                            
                            {report.targetImage && (
                                <div className="report-image-container">
                                    <img src={report.targetImage} alt="Violated content" className="report-image" />
                                </div>
                            )}
                             {report.targetSticker && (
                                <div className="report-sticker-container">
                                    <img src={report.targetSticker} alt="Sticker" className="report-sticker" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="report-modal-footer">
                    <button onClick={onDismiss} className="report-btn report-btn-dismiss">
                        <FaCheck /> Bỏ qua
                    </button>
                    
                    <button onClick={onDelete} className="report-btn report-btn-delete">
                        <FaTrash /> Xoá nội dung
                    </button>

                    <button onClick={onBan} className="report-btn report-btn-ban">
                        <FaBan /> Ban & Xoá
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportManagementModal;