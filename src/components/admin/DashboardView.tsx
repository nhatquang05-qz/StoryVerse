import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    type ChartOptions
} from 'chart.js';
import { 
    FiDollarSign, 
    FiActivity, 
    FiTrendingUp,
    FiTrendingDown,
    FiUsers, 
    FiShoppingCart, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle
} from 'react-icons/fi';

import '../../assets/styles/DashboardView.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface Transaction {
    id: string;
    userName: string;
    type: 'Nạp xu' | 'Mua truyện' | 'Đăng ký VIP';
    amount: number;
    status: 'success' | 'pending' | 'failed';
    date: string;
}

const DashboardView: React.FC = () => {
    type Period = 'day' | 'week' | 'month' | 'year';
    const [period, setPeriod] = useState<Period>('month');

    const [stats] = useState({
        revenue: 15000000,
        views: 125000,
        totalUsers: 3500,
        newOrders: 120,
        revenueGrowth: 12.5,
        viewsGrowth: 8.2,
        usersGrowth: 5.4,
        ordersGrowth: -2.1
    });

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // Mô phỏng gọi API
        const fetchData = async () => {
            // setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockTransactions: Transaction[] = [
                { id: 'TRX-001', userName: 'nguyenvan_a', type: 'Nạp xu', amount: 50000, status: 'success', date: '2023-11-18 10:30' },
                { id: 'TRX-002', userName: 'lethib_b', type: 'Mua truyện', amount: 5000, status: 'success', date: '2023-11-18 11:15' },
                { id: 'TRX-003', userName: 'tranc_c', type: 'Nạp xu', amount: 100000, status: 'pending', date: '2023-11-18 12:00' },
                { id: 'TRX-004', userName: 'hoangd_d', type: 'Đăng ký VIP', amount: 200000, status: 'failed', date: '2023-11-17 09:45' },
                { id: 'TRX-005', userName: 'nguyenvan_e', type: 'Mua truyện', amount: 2000, status: 'success', date: '2023-11-17 08:20' },
            ];
            setTransactions(mockTransactions);
        };

        fetchData();
    }, [period]);

    const lineChartData = {
        labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'],
        datasets: [
            {
                label: 'Doanh Thu (VNĐ)',
                data: [3500000, 4200000, 3800000, 4500000],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Lượt Xem',
                data: [28000, 32000, 30000, 35000],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };

    const lineChartOptions: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false, // Quan trọng để fill container
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: false },
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Doanh Thu (VNĐ)' },
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Lượt Xem' },
            },
        },
    };

    const barChartData = {
        labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
        datasets: [
            {
                label: 'Thành viên mới',
                data: [12, 19, 15, 25, 22, 30, 35],
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
            },
        ],
    };

    const doughnutData = {
        labels: ['Thành công', 'Đang xử lý', 'Thất bại'],
        datasets: [
            {
                data: [85, 10, 5],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    };

    return (
        <div className="dashboard-container">
            {/* Header & Filter */}
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h2>Tổng Quan Hệ Thống</h2>
                    <p className="dashboard-subtitle">Cập nhật lần cuối: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="filter-group">
                    {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`filter-btn ${period === p ? 'active' : ''}`}
                        >
                            {p === 'day' ? 'Ngày' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Doanh Thu */}
                <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Doanh Thu</span>
                            <h3 className="stat-value">{formatCurrency(stats.revenue)}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-emerald-light">
                            <FiDollarSign size={24} color="#059669" />
                        </div>
                    </div>
                    <div className="stat-trend">
                        {stats.revenueGrowth >= 0 ? (
                            <span className="trend-indicator color-emerald">
                                <FiTrendingUp style={{ marginRight: '4px' }} /> +{stats.revenueGrowth}%
                            </span>
                        ) : (
                            <span className="trend-indicator color-red">
                                <FiTrendingDown style={{ marginRight: '4px' }} /> {stats.revenueGrowth}%
                            </span>
                        )}
                        <span className="trend-text">so với kỳ trước</span>
                    </div>
                </div>

                {/* Lượt Xem */}
                <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Lượt Truy Cập</span>
                            <h3 className="stat-value">{stats.views.toLocaleString('vi-VN')}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-blue-light">
                            <FiActivity size={24} color="#2563eb" />
                        </div>
                    </div>
                    <div className="stat-trend">
                        <span className="trend-indicator color-blue">
                            <FiTrendingUp style={{ marginRight: '4px' }} /> +{stats.viewsGrowth}%
                        </span>
                        <span className="trend-text">so với kỳ trước</span>
                    </div>
                </div>

                {/* Thành Viên */}
                <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Tổng Thành Viên</span>
                            <h3 className="stat-value">{stats.totalUsers.toLocaleString('vi-VN')}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-violet-light">
                            <FiUsers size={24} color="#7c3aed" />
                        </div>
                    </div>
                    <div className="stat-trend">
                        <span className="trend-indicator color-violet">
                            <FiTrendingUp style={{ marginRight: '4px' }} /> +{stats.usersGrowth}%
                        </span>
                        <span className="trend-text">so với kỳ trước</span>
                    </div>
                </div>

                {/* Đơn Hàng */}
                <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
                    <div className="stat-header">
                        <div>
                            <span className="stat-label">Đơn Hàng Mới</span>
                            <h3 className="stat-value">{stats.newOrders}</h3>
                        </div>
                        <div className="stat-icon-wrapper bg-amber-light">
                            <FiShoppingCart size={24} color="#d97706" />
                        </div>
                    </div>
                    <div className="stat-trend">
                         {stats.ordersGrowth >= 0 ? (
                            <span className="trend-indicator color-emerald">
                                <FiTrendingUp style={{ marginRight: '4px' }} /> +{stats.ordersGrowth}%
                            </span>
                        ) : (
                            <span className="trend-indicator color-red">
                                <FiTrendingDown style={{ marginRight: '4px' }} /> {stats.ordersGrowth}%
                            </span>
                        )}
                        <span className="trend-text">so với kỳ trước</span>
                    </div>
                </div>
            </div>

            {/* Charts Section 1: Main Stats */}
            <div className="chart-section">
                <div className="chart-header">
                    <h3 className="chart-title">Biểu Đồ Doanh Thu & Lưu Lượng</h3>
                </div>
                <div className="main-chart-wrapper">
                    <Line options={lineChartOptions} data={lineChartData} />
                </div>
            </div>

            {/* Charts Section 2: Split View */}
            <div className="chart-split-view">
                {/* User Growth */}
                <div className="sub-chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Tăng Trưởng Thành Viên</h3>
                    </div>
                    <div className="sub-chart-wrapper">
                        <Bar options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} data={barChartData} />
                    </div>
                </div>

                {/* Transaction Status */}
                <div className="sub-chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Trạng Thái Giao Dịch</h3>
                    </div>
                    <div className="sub-chart-wrapper">
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="transactions-table-container">
                <div className="table-header">
                    <h3 className="chart-title">Lịch Sử Giao Dịch Gần Nhất</h3>
                    <button className="view-all-btn">Xem tất cả</button>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Mã GD</th>
                                <th>Người Dùng</th>
                                <th>Loại</th>
                                <th>Số Tiền</th>
                                <th style={{ textAlign: 'center' }}>Trạng Thái</th>
                                <th style={{ textAlign: 'right' }}>Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id}>
                                    <td className="col-id">{tx.id}</td>
                                    <td>{tx.userName}</td>
                                    <td>
                                        <span className={`badge-type badge-${tx.type.toLowerCase().replace(/ /g, '-')}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="col-amount">
                                        {formatCurrency(tx.amount)}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {tx.status === 'success' && <FiCheckCircle color="#10b981" />}
                                        {tx.status === 'pending' && <FiClock color="#f59e0b" />}
                                        {tx.status === 'failed' && <FiXCircle color="#ef4444" />}
                                    </td>
                                    <td style={{ textAlign: 'right', color: '#64748b' }}>{tx.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;