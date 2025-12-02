import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/ProfilePage.css'; 
import '../../assets/styles/TransactionHistory.css'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Transaction {
    id: number;
    orderId: string;
    transactionCode?: string;
    amount: number;
    status: string;
    type: 'RECHARGE' | 'PURCHASE';
    description: string;
    createdAt: string;
}

const TransactionHistory: React.FC = () => {
    const { token } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/users/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [token]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="profile-loading">Đang tải lịch sử...</div>;

    return (
        <div className="profile-section">
            <h2 className="section-title">Lịch Sử Giao Dịch</h2>
            
            {transactions.length === 0 ? (
                <p style={{textAlign: 'center', color: '#666', marginTop: '20px'}}>Chưa có giao dịch nào.</p>
            ) : (
                <div className="transaction-table-wrapper">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Thời gian</th>
                                <th>Mã GD</th>
                                <th>Nội dung</th>
                                <th style={{textAlign: 'center'}}>Loại</th>
                                <th style={{textAlign: 'right'}}>Số tiền</th>
                                <th style={{textAlign: 'center'}}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(item => (
                                <tr key={item.id}>
                                    <td>{formatDate(item.createdAt)}</td>
                                    
                                    <td className="col-code">
                                        {item.transactionCode || item.orderId}
                                    </td>
                                    
                                    <td className="col-desc">{item.description}</td>
                                    
                                    <td style={{textAlign: 'center'}}>
                                        <span className={`transaction-badge ${item.type === 'RECHARGE' ? 'badge-recharge' : 'badge-purchase'}`}>
                                            {item.type === 'RECHARGE' ? 'Nạp Xu' : 'Mua Truyện'}
                                        </span>
                                    </td>

                                    <td className={`col-amount ${item.type === 'RECHARGE' ? 'amount-plus' : 'amount-minus'}`}>
                                        {item.type === 'RECHARGE' ? '+' : '-'}{formatCurrency(item.amount)}
                                    </td>

                                    <td style={{textAlign: 'center'}}>
                                        <span className={`transaction-badge ${item.status === 'SUCCESS' ? 'status-success' : 'status-failed'}`}>
                                            {item.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;