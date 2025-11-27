import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/ProfilePage.css'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Transaction {
    id: number;
    orderId: string;
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
                    <table className="transaction-table" style={{width: '100%', borderCollapse: 'collapse', marginTop: '15px'}}>
                        <thead>
                            <tr style={{borderBottom: '2px solid #eee', color: 'var(--text-color)'}}>
                                <th style={{padding: '12px', textAlign: 'left'}}>Thời gian</th>
                                <th style={{padding: '12px', textAlign: 'left'}}>Mã GD</th>
                                <th style={{padding: '12px', textAlign: 'left'}}>Nội dung</th>
                                <th style={{padding: '12px', textAlign: 'left'}}>Loại</th>
                                <th style={{padding: '12px', textAlign: 'right'}}>Số tiền</th>
                                <th style={{padding: '12px', textAlign: 'center'}}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(item => (
                                <tr key={item.id} style={{borderBottom: '1px solid #eee', color: 'var(--text-color)'}}>
                                    <td style={{padding: '12px'}}>{formatDate(item.createdAt)}</td>
                                    <td style={{padding: '12px', fontSize: '0.9rem', color: '#888'}}>{item.orderId}</td>
                                    <td style={{padding: '12px'}}>{item.description}</td>
                                    <td style={{padding: '12px'}}>
                                        <span style={{
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            backgroundColor: item.type === 'RECHARGE' ? '#e6fffa' : '#ebf8ff',
                                            color: item.type === 'RECHARGE' ? '#2c7a7b' : '#2b6cb0'
                                        }}>
                                            {item.type === 'RECHARGE' ? 'Nạp Xu' : 'Mua Truyện'}
                                        </span>
                                    </td>
                                    <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: item.type === 'RECHARGE' ? '#38a169' : '#e53e3e'}}>
                                        {item.type === 'RECHARGE' ? '+' : '-'}{formatCurrency(item.amount)}
                                    </td>
                                    <td style={{padding: '12px', textAlign: 'center'}}>
                                        <span style={{color: item.status === 'SUCCESS' ? 'green' : 'red'}}>
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