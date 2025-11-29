import React, { useState, useEffect } from 'react';
import { Line, Bar, Radar, PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { 
    FiDollarSign, FiUsers, FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiBookOpen, FiFilter, FiTrendingUp, FiAlertCircle, FiServer
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/DashboardView.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const DashboardView: React.FC = () => {
    const { token } = useAuth(); 
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'day' | 'month' | 'year'>('day');
    
    const [data, setData] = useState({
        stats: { revenue: 0, users: 0, orders: 0, comics: 0 },
        charts: { revenue: [], users: [], orders: [] },
        transactions: [],
        topComics: [],
        genreStats: { labels: [], data: [] },
        revenueSource: { labels: [], data: [] }
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
        
        if (['nạp', 'deposit', 'recharge', 'nap_xu'].some(k => typeLower.includes(k))) {
            return <span className="badge-type badge-nạp-xu">Nạp xu</span>;
        } 
        else if (['mua', 'purchase', 'buy', 'unlock', 'mua_truyen'].some(k => typeLower.includes(k))) {
            return <span className="badge-type badge-mua-truyện">Mua truyện</span>;
        } 
        else if (['vip', 'subscribe'].some(k => typeLower.includes(k))) {
            return <span className="badge-type badge-đăng-ký-vip">Gói VIP</span>;
        }
        else {
            return <span className="badge-type badge-default">{type}</span>;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusLower = status?.toLowerCase() || '';
        if (['success', 'completed', 'thành công', 'paid'].includes(statusLower)) {
            return <div className="status-badge status-success"><FiCheckCircle /> <span>Thành công</span></div>;
        }
        if (['failed', 'cancelled', 'thất bại'].includes(statusLower)) {
            return <div className="status-badge status-failed"><FiXCircle /> <span>Thất bại</span></div>;
        }
        return <div className="status-badge status-pending"><FiClock /> <span>Đang xử lý</span></div>;
    };

    const formatCurrency = (amount: number) => Number(amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    const lineChartData = {
        labels: data.charts.revenue?.map((item: any) => item.date) || [],
        datasets: [{
            label: `Doanh Thu (VNĐ)`,
            data: data.charts.revenue?.map((item: any) => item.total) || [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
        }],
    };

    const barChartData = {
        labels: data.charts.users?.map((item: any) => item.date) || [],
        datasets: [{
            label: 'Thành viên mới',
            data: data.charts.users?.map((item: any) => item.count) || [],
            backgroundColor: '#8b5cf6',
            borderRadius: 6,
        }],
    };

    const radarData = {
        labels: data.genreStats.labels.length > 0 ? data.genreStats.labels : ['Chưa có dữ liệu'],
        datasets: [{
            label: 'Số lượng truyện theo thể loại',
            data: data.genreStats.data.length > 0 ? data.genreStats.data : [0],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: '#3b82f6',
            borderWidth: 2,
            pointBackgroundColor: '#3b82f6',
        }],
    };

    const polarData = {
        labels: data.revenueSource.labels.length > 0 ? data.revenueSource.labels : ['Chưa có dữ liệu'],
        datasets: [{
            label: 'Nguồn thu',
            data: data.revenueSource.data.length > 0 ? data.revenueSource.data : [0],
            backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
            borderWidth: 1,
        }],
    };

    if (loading) return <div className="loading-container">Đang tải dữ liệu...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h2>Tổng Quan Hệ Thống</h2>
                    <p className="dashboard-subtitle">Số liệu thực tế từ cơ sở dữ liệu</p>
                </div>
                <div className="dashboard-filter">
                    <FiFilter />
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="time-range-select">
                        <option value="day">Hôm nay</option>
                        <option value="month">Tháng này</option>
                        <option value="year">Năm nay</option>
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card border-emerald">
                    <div className="stat-header">
                        <div><span className="stat-label">Tổng Doanh Thu</span><h3 className="stat-value">{formatCurrency(data.stats.revenue)}</h3></div>
                        <div className="stat-icon-wrapper bg-emerald-light"><FiDollarSign size={24} color="#059669" /></div>
                    </div>
                </div>
                <div className="stat-card border-violet">
                    <div className="stat-header">
                        <div><span className="stat-label">Tổng Thành Viên</span><h3 className="stat-value">{data.stats.users.toLocaleString('vi-VN')}</h3></div>
                        <div className="stat-icon-wrapper bg-violet-light"><FiUsers size={24} color="#7c3aed" /></div>
                    </div>
                </div>
                <div className="stat-card border-amber">
                    <div className="stat-header">
                        <div><span className="stat-label">Tổng Đơn Hàng</span><h3 className="stat-value">{data.stats.orders.toLocaleString('vi-VN')}</h3></div>
                        <div className="stat-icon-wrapper bg-amber-light"><FiShoppingCart size={24} color="#d97706" /></div>
                    </div>
                </div>
                <div className="stat-card border-blue">
                    <div className="stat-header">
                        <div><span className="stat-label">Tổng Truyện</span><h3 className="stat-value">{data.stats.comics.toLocaleString('vi-VN')}</h3></div>
                        <div className="stat-icon-wrapper bg-blue-light"><FiBookOpen size={24} color="#2563eb" /></div>
                    </div>
                </div>
            </div>

            {/* System Health & Pending Tasks */}
            <div className="system-health-grid">
                <div className="health-card pending-tasks">
                    <h3 className="card-title-sm"><FiAlertCircle /> Cần Xử Lý Ngay</h3>
                    <ul className="task-list">
                        <li>
                            <span className="task-count">3</span>
                            <span className="task-desc">Báo cáo vi phạm từ người dùng</span>
                            <button className="task-btn">Xem</button>
                        </li>
                        <li>
                            <span className="task-count">5</span>
                            <span className="task-desc">Bình luận cần kiểm duyệt</span>
                            <button className="task-btn">Xem</button>
                        </li>
                    </ul>
                </div>
                <div className="health-card system-status">
                    <h3 className="card-title-sm"><FiServer /> Trạng Thái Hệ Thống</h3>
                    <div className="status-item">
                        <span>Database Connection</span>
                        <span className="status-ok">Ổn định</span>
                    </div>
                    <div className="status-item">
                        <span>API Latency</span>
                        <span className="status-ok">45ms</span>
                    </div>
                </div>
            </div>

            <div className="chart-section">
                <div className="chart-header"><h3 className="chart-title">Biểu Đồ Doanh Thu</h3></div>
                <div className="main-chart-wrapper">
                    <Line options={{ responsive: true, maintainAspectRatio: false }} data={lineChartData} />
                </div>
            </div>

            <div className="chart-triple-view">
                <div className="sub-chart-card">
                    <div className="chart-header"><h3 className="chart-title">Người Dùng Mới</h3></div>
                    <div className="sub-chart-wrapper"><Bar options={{ responsive: true, maintainAspectRatio: false }} data={barChartData} /></div>
                </div>
                <div className="sub-chart-card">
                    <div className="chart-header"><h3 className="chart-title">Phân Bố Thể Loại</h3></div>
                    <div className="sub-chart-wrapper"><Radar data={radarData} options={{ maintainAspectRatio: false }} /></div>
                </div>
                <div className="sub-chart-card">
                    <div className="chart-header"><h3 className="chart-title">Nguồn Doanh Thu</h3></div>
                    <div className="sub-chart-wrapper"><PolarArea data={polarData} options={{ maintainAspectRatio: false }} /></div>
                </div>
            </div>

            <div className="transactions-table-container" style={{marginBottom: '2rem'}}>
                <div className="table-header">
                    <h3 className="chart-title flex-align"><FiTrendingUp /> Top Truyện Bán Chạy Nhất</h3>
                </div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên Truyện</th>
                                <th>Tác Giả</th>
                                <th>Lượt Mua</th>
                                <th className="text-right">Doanh Thu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.topComics && data.topComics.length > 0 ? (
                                data.topComics.map((comic: any, index: number) => (
                                    <tr key={comic.id || index}>
                                        <td className="font-bold">#{index + 1}</td>
                                        <td>{comic.title}</td>
                                        <td>{comic.author || 'N/A'}</td>
                                        <td style={{fontWeight: 'bold', color: '#3b82f6'}}>{comic.salesCount}</td>
                                        <td className="comic-revenue-cell">{formatCurrency(comic.totalRevenue)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="empty-state-cell">Chưa có dữ liệu bán hàng</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="transactions-table-container">
                <div className="table-header"><h3 className="chart-title">Giao Dịch Gần Nhất</h3></div>
                <div className="table-responsive">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Mã GD</th>
                                <th>Người Dùng</th>
                                <th>Loại</th>
                                <th>Số Tiền</th>
                                <th>Trạng Thái</th>
                                <th className="text-right">Thời Gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.transactions && data.transactions.length > 0 ? (
                                data.transactions.map((tx: any) => (
                                    <tr key={tx.id}>
                                        <td className="col-id" style={{fontFamily: 'monospace', fontSize: '0.9em', color: '#555'}}>
                                            {tx.transactionCode || tx.orderId || `#${tx.id}`}
                                        </td>
                                        <td>{tx.userName || tx.user_name || 'Unknown'}</td>
                                        <td>{getTypeBadge(tx.type)}</td>
                                        <td className="col-amount">{formatCurrency(tx.amount)}</td>
                                        <td>{getStatusBadge(tx.status)}</td>
                                        <td className="tx-time-cell">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="empty-state-cell-large">Chưa có giao dịch nào</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;