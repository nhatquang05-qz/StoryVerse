import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/minigame/EventHistoryModal.css';

interface HistoryItem {
    source: string;
    value: string;
    createdAt: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const EventHistoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { token } = useAuth();
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            fetchHistory();
        }
    }, [isOpen, token]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/minigame/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="gift-modal-overlay">
            <div className="history-modal-content">
                <button className="close-rules-btn" onClick={onClose}>✕</button>
                <h2 className="history-header">LỊCH SỬ NHẬN QUÀ</h2>

                <div className="history-list-container">
                    {loading ? (
                        <p className="empty-history">Đang tải dữ liệu...</p>
                    ) : history.length === 0 ? (
                        <p className="empty-history">Chưa có lịch sử nhận quà nào.</p>
                    ) : (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '35%' }}>Thời gian</th>
                                    <th style={{ width: '40%' }}>Nguồn</th>
                                    <th style={{ width: '25%' }}>Quà</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((item, index) => (
                                    <tr key={index}>
                                        <td>{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                                        <td>
                                            <span className={item.source.includes('Lời chúc') ? 'source-wish' : 'source-box'}>
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="value-coin">{item.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventHistoryModal;