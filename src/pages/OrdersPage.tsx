import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/ProfilePage.css'; 

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Order {
    id: number;
    createdAt: string;
    totalAmount: number;
    status: string;
    items: any[];
}

const OrdersPage: React.FC = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                const response = await fetch(`${API_URL}/orders/my-orders`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Lỗi tải đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const getStatusBadge = (status: string) => {
        const styles: any = {
            'PENDING': { bg: '#fff3cd', color: '#856404', label: 'Chờ thanh toán' },
            'PAID': { bg: '#d4edda', color: '#155724', label: 'Đã thanh toán' },
            'PROCESSING': { bg: '#cce5ff', color: '#004085', label: 'Đang xử lý' },
            'CANCELLED': { bg: '#f8d7da', color: '#721c24', label: 'Đã hủy' },
        };
        const s = styles[status] || styles['PENDING'];
        return <span style={{ backgroundColor: s.bg, color: s.color, padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold' }}>{s.label}</span>;
    };

    if (loading) return <div className="page-container" style={{textAlign: 'center', padding: '50px'}}>Đang tải lịch sử đơn hàng...</div>;

    return (
        <div className="page-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Lịch Sử Mua Hàng</h2>
            
            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'var(--card-bg)', borderRadius: '10px' }}>
                    <p>Bạn chưa có đơn hàng nào.</p>
                    <Link to="/physical-comics" className="auth-button" style={{ display: 'inline-block', marginTop: '10px', width: 'auto', padding: '10px 20px' }}>Mua sắm ngay</Link>
                </div>
            ) : (
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.id} className="order-card" style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div className="order-header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                                <div>
                                    <strong>Đơn hàng #{order.id}</strong>
                                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>
                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                <div>{getStatusBadge(order.status)}</div>
                            </div>
                            
                            <div className="order-items">
                                {order.items.map((item: any, idx: number) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                        <img src={item.coverImageUrl} alt={item.title} style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }} />
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 'bold' }}>{item.title}</p>
                                            <p style={{ margin: 0, fontSize: '0.9rem' }}>x{item.quantity}</p>
                                        </div>
                                        <div style={{ marginLeft: 'auto' }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="order-footer" style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <span style={{ marginRight: '10px' }}>Tổng tiền:</span>
                                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;