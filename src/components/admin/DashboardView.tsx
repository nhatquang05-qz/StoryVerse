import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { 
    FiDollarSign, FiUsers, FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiBookOpen, FiFilter, FiTrendingUp
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/DashboardView.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const DashboardView: React.FC = () => {
    const { token } = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('day');
    
    const [data, setData] = useState({
        stats: { revenue: 0, users: 0, orders: 0, comics: 0 },
        charts: { revenue: [], users: [], orders: [] },
        transactions: [],
        topComics: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats?period=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        setData(result.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token, timeRange]);


    const getTypeBadge = (type: string) => {
        const typeLower = type?.toLowerCase() || '';
        
        const baseStyle = {
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'inline-block'
        };

        if (typeLower.includes('nạp') || typeLower.includes('deposit') || typeLower.includes('recharge')) {
            return (
                <span style={{ ...baseStyle, backgroundColor: '#dbeafe', color: '#1e40af' }}>
                    Nạp xu
                </span>
            );
        } 
        else if (typeLower.includes('mua') || typeLower.includes('buy') || typeLower.includes('purchase')) {
            return (
                <span style={{ ...baseStyle, backgroundColor: '#ffedd5', color: '#c2410c' }}>
                    Mua truyện
                </span>
            );
        } 
        else {
            return (
                <span style={{ ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' }}>
                    {type}
                </span>
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        
        if (['success', 'completed', 'thành công'].includes(statusLower)) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 500 }}>
                    <FiCheckCircle /> <span>Thành công</span>
                </div>
            );
        }
        if (['failed', 'cancelled', 'thất bại'].includes(statusLower)) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 500 }}>
                    <FiXCircle /> <span>Thất bại</span>
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 500 }}>
                <FiClock /> <span>Đang xử lý</span>
            </div>
        );
    };

    const revenueLabels = data.charts.revenue.map((item: any) => item.date);
    const revenueValues = data.charts.revenue.map((item: any) => item.total);
    const lineChartData = {
        labels: revenueLabels.length > 0 ? revenueLabels : ['Chưa có dữ liệu'],
        datasets: [{
            label: `Doanh Thu (${timeRange === 'day' ? 'Ngày' : timeRange === 'month' ? 'Tháng' : 'Năm'})`,
            data: revenueValues.length > 0 ? revenueValues : [0],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
        }],
    };

    const userLabels = data.charts.users.map((item: any) => item.date);
    const userValues = data.charts.users.map((item: any) => item.count);
    const barChartData = {
        labels: userLabels.length > 0 ? userLabels : ['Chưa có dữ liệu'],
        datasets: [{
            label: 'Thành viên mới',
            data: userValues.length > 0 ? userValues : [0],
            backgroundColor: 'rgba(139, 92, 246, 0.6)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1,
        }],
    };

    const doughnutData = {
        labels: ['Thành công', 'Đang xử lý', 'Thất bại'],
        datasets: [{
            data: data.charts.orders.length > 0 ? data.charts.orders.map((i:any) => i.count) : [1],
            backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
            borderWidth: 1,
        }],
    };

    const formatCurrency = (amount: number) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    if (loading) return <div style={{padding: '2rem'}}>Đang tải dữ liệu...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h2>Tổng Quan Hệ Thống</h2>
                    <p className="dashboard-subtitle">Số liệu cập nhật theo thời gian thực</p>
                </div>
                <div className="dashboard-filter">
                    <FiFilter />
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value as any)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="day">Theo Ngày</option>
                        <option value="month">Theo Tháng</option>
                        <option value="year">Theo Năm</option>
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Doanh Thu</span>
                            <h3 className="stat-value">{formatCurrency(data.stats.revenue)}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-emerald-light"><FiDollarSign size={24} color="#059669" /></div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Thành Viên</span>
                            <h3 className="stat-value">{data.stats.users.toLocaleString('vi-VN')}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-violet-light"><FiUsers size={24} color="#7c3aed" /></div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Đơn Hàng</span>
                            <h3 className="stat-value">{data.stats.orders.toLocaleString('vi-VN')}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-amber-light"><FiShoppingCart size={24} color="#d97706" /></div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Truyện</span>
                            <h3 className="stat-value">{data.stats.comics.toLocaleString('vi-VN')}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-blue-light"><FiBookOpen size={24} color="#2563eb" /></div>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-header">
                    <h3 className="chart-title">Biểu Đồ Doanh Thu ({timeRange === 'day' ? '7 ngày gần nhất' : timeRange === 'month' ? '12 tháng gần nhất' : '5 năm gần nhất'})</h3>
                </div>
                <div className="main-chart-wrapper">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={lineChartData} />
                </div>
            </div>

            <div className="chart-split-view">
                <div className="sub-chart-card">
                    <div className="chart-header"><h3 className="chart-title">Người Dùng Mới</h3></div>
                    <div className="sub-chart-wrapper">
                        <Bar options={{ responsive: true, maintainAspectRatio: false }} data={barChartData} />
                    </div>
                </div>
                <div className="sub-chart-card">
                    <div className="chart-header"><h3 className="chart-title">Trạng Thái Đơn Hàng</h3></div>
                    <div className="sub-chart-wrapper">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <div className="transactions-table-container">
                <div className="table-header">
                    <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiTrendingUp /> Top Truyện Bán Chạy
                    </h3>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên Truyện</th>
                                <th>Lượt Mua/Mở Khóa</th>
                                <th style={{ textAlign: 'right' }}>Doanh Thu (Ước tính)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topComics && data.topComics.length > 0 ? (
                                data.topComics.map((comic: any, index: number) => (
                                    <tr key={comic.id || index}>
                                        <td style={{ fontWeight: 'bold' }}>#{index + 1}</td>
                                        <td>{comic.title}</td>
                                        <td>{comic.salesCount}</td>
                                        <td style={{ textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                                            {formatCurrency(comic.totalRevenue || 0)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{textAlign: 'center', padding: '1.5rem'}}>Chưa có dữ liệu truyện bán chạy</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="transactions-table-container">
                <div className="table-header">
                    <h3 className="chart-title">Giao Dịch Gần Nhất</h3>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Mã GD</th>
                                <th>Người Dùng</th>
                                <th>Loại</th>
                                <th>Số Tiền</th>
                                <th>Trạng Thái</th>
                                <th style={{ textAlign: 'right' }}>Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions.length > 0 ? (
                                data.transactions.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td className="col-id">#{tx.id}</td>
                                        <td>{tx.userName || 'Unknown'}</td>
                                        <td>{getTypeBadge(tx.type)}</td>
                                        <td className="col-amount">{formatCurrency(tx.amount)}</td>
                                        <td>{getStatusBadge(tx.status)}</td>
                                        <td style={{ textAlign: 'right', color: '#64748b' }}>
                                            {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '2rem'}}>Chưa có giao dịch nào</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;