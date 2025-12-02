import React, { useState, useEffect } from 'react';
import { Line, Bar, Radar, PolarArea } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { 
    FiDollarSign, FiUsers, FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiBookOpen, FiFilter, FiTrendingUp, FiAlertCircle, FiServer, FiEye, FiMessageSquare, FiFileText
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import ReportManagementModal from './ReportManagementModal';
import '../../assets/styles/DashboardView.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ReportItem {
    id: number;
    reporterName: string;
    reportedUserName: string;
    reportedUserId: number;
    reason: string;
    targetType: 'POST' | 'COMMENT';
    targetContent: string;
    targetImage?: string;
    targetSticker?: string;
    createdAt: string;
    status: string;
}

const DashboardView: React.FC = () => {
    const { token } = useAuth(); 
    const { showNotification } = useNotification();
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

    const [postReports, setPostReports] = useState<ReportItem[]>([]);
    const [commentReports, setCommentReports] = useState<ReportItem[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        if (!token) return;

        try {
            const [dashboardRes, reportRes] = await Promise.all([
                fetch(`${API_BASE_URL}/admin/dashboard-stats?period=${timeRange}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE_URL}/admin/reports/pending`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);
            
            if (dashboardRes.ok) {
                const result = await dashboardRes.json();
                if (result.success) {
                    setData(result.data);
                }
            }

            if (reportRes.ok) {
                const reportData = await reportRes.json();
                setPostReports(reportData.posts || []);
                setCommentReports(reportData.comments || []);
            }

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [token, timeRange]);

    const handleViewReport = (report: ReportItem) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const handleDeleteContent = async () => {
        if (!selectedReport) return;
        if (!window.confirm('Bạn chắc chắn muốn xoá nội dung này?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/reports/${selectedReport.id}/content`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showNotification('Đã xoá nội dung thành công', 'success');
                setIsModalOpen(false);
                fetchDashboardData();
            } else {
                showNotification('Xoá thất bại', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    const handleBanUser = async () => {
        if (!selectedReport) return;
        if (!window.confirm(`CẢNH BÁO: Bạn sắp BAN tài khoản "${selectedReport.reportedUserName}" và XOÁ nội dung này. Hành động này không thể hoàn tác. Tiếp tục?`)) return;

        try {
            const res = await fetch(`${API_BASE_URL}/admin/reports/${selectedReport.id}/ban`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                showNotification('Đã ban người dùng và xoá nội dung', 'success');
                setIsModalOpen(false);
                fetchDashboardData();
            } else {
                showNotification('Thao tác thất bại', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối', 'error');
        }
    };

    const handleDismissReport = async () => {
        if (!selectedReport) return;
        try {
            const res = await fetch(`${API_BASE_URL}/admin/reports/${selectedReport.id}/dismiss`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showNotification('Đã bỏ qua báo cáo', 'info');
                setIsModalOpen(false);
                fetchDashboardData();
            }
        } catch (error) { console.error(error); }
    };

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

    // Chart Data (Keeping original logic)
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

            <div className="system-health-grid">
                <div className="health-card pending-tasks">
                    <h3 className="card-title-sm" style={{color: 'red'}}><FiAlertCircle /> Cần Xử Lý Ngay</h3>
                    <ul className="task-list">
                        <li>
                            <span className="task-count" style={{backgroundColor: postReports.length > 0 ? '#ef4444' : '#10b981'}}>{postReports.length}</span>
                            <span className="task-desc">Báo cáo vi phạm (Bài viết)</span>
                            <button className="task-btn" onClick={() => {
                                const el = document.getElementById('report-tables');
                                el?.scrollIntoView({behavior: 'smooth'});
                            }}>Xem</button>
                        </li>
                        <li>
                            <span className="task-count" style={{backgroundColor: commentReports.length > 0 ? '#f59e0b' : '#10b981'}}>{commentReports.length}</span>
                            <span className="task-desc">Bình luận cần kiểm duyệt</span>
                            <button className="task-btn" onClick={() => {
                                const el = document.getElementById('report-tables');
                                el?.scrollIntoView({behavior: 'smooth'});
                            }}>Xem</button>
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

            <div id="report-tables" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '2rem'}}>
                <div className="transactions-table-container" style={{marginBottom: 0}}>
                    <div className="table-header">
                        <h3 className="chart-title flex-align" style={{color: '#ef4444'}}>
                            <FiFileText style={{marginRight: '8px'}} /> Báo cáo Vi Phạm (Bài viết)
                        </h3>
                    </div>
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Người báo cáo</th>
                                    <th>Lý do</th>
                                    <th className="text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {postReports.length > 0 ? postReports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.reporterName}</td>
                                        <td style={{maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{report.reason}</td>
                                        <td className="text-right">
                                            <button className="task-btn" onClick={() => handleViewReport(report)} style={{padding: '4px 10px'}}><FiEye /> Xem</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="empty-state-cell">Không có báo cáo nào.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="transactions-table-container" style={{marginBottom: 0}}>
                    <div className="table-header">
                        <h3 className="chart-title flex-align" style={{color: '#f59e0b'}}>
                            <FiMessageSquare style={{marginRight: '8px'}} /> Kiểm Duyệt Bình Luận
                        </h3>
                    </div>
                    <div className="table-responsive">
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Người báo cáo</th>
                                    <th>Lý do</th>
                                    <th className="text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commentReports.length > 0 ? commentReports.map(report => (
                                    <tr key={report.id}>
                                        <td>{report.reporterName}</td>
                                        <td style={{maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{report.reason}</td>
                                        <td className="text-right">
                                            <button className="task-btn" onClick={() => handleViewReport(report)} style={{padding: '4px 10px'}}><FiEye /> Xem</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="empty-state-cell">Không có bình luận cần duyệt.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
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
                                <th>Số Lượng</th> 
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

            <ReportManagementModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                report={selectedReport}
                onDelete={handleDeleteContent}
                onBan={handleBanUser}
                onDismiss={handleDismissReport}
            />
        </div>
    );
};

export default DashboardView;