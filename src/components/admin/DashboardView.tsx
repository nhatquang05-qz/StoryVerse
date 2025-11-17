import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    type ChartData,
} from 'chart.js';
import { FiDollarSign, FiActivity, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DashboardView: React.FC = () => {
    type Period = 'day' | 'week' | 'month' | 'year';
    const [period, setPeriod] = useState<Period>('month');

    // --- FAKE DATA GENERATION ---
    // GHI CHÚ: Đây là dữ liệu giả.
    // Để có dữ liệu thật, bạn cần tạo API backend mới (ví dụ: /api/admin/stats?period=month)
    // và gọi fetch thay vì các hàm generateFake... này.

    const generateFakeStats = (p: Period) => {
        // Dữ liệu giả cho các thẻ thông số
        let views = 0;
        let revenue = 0;
        let coinsSpent = 0;
        
        switch (p) {
            case 'day':
                views = Math.floor(Math.random() * 1500) + 500;
                revenue = Math.floor(Math.random() * 500000) + 100000;
                coinsSpent = Math.floor(Math.random() * 3000) + 1000;
                break;
            case 'week':
                views = Math.floor(Math.random() * 10000) + 5000;
                revenue = Math.floor(Math.random() * 4000000) + 1000000;
                coinsSpent = Math.floor(Math.random() * 20000) + 10000;
                break;
            case 'year':
                views = Math.floor(Math.random() * 500000) + 200000;
                revenue = Math.floor(Math.random() * 200000000) + 100000000;
                coinsSpent = Math.floor(Math.random() * 1000000) + 500000;
                break;
            case 'month':
            default:
                views = Math.floor(Math.random() * 40000) + 20000;
                revenue = Math.floor(Math.random() * 15000000) + 5000000;
                coinsSpent = Math.floor(Math.random() * 80000) + 40000;
                break;
        }
        return { views, revenue, coinsSpent };
    };

    const generateFakeChartData = (p: Period): ChartData<'line'> => {
        // Dữ liệu giả cho biểu đồ
        let labels: string[] = [];
        let data: number[] = [];

        switch (p) {
            case 'day':
                labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
                data = Array.from({ length: 24 }, () => Math.floor(Math.random() * 100));
                break;
            case 'week':
                labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
                data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 1500) + 500);
                break;
            case 'year':
                labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
                data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 40000) + 10000);
                break;
            case 'month':
            default:
                labels = Array.from({ length: 30 }, (_, i) => `Ngày ${i + 1}`);
                data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000) + 200);
                break;
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Lượt truy cập (Views)',
                    data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.1,
                },
            ],
        };
    };

    // --- END FAKE DATA ---

    const { views, revenue, coinsSpent } = useMemo(() => generateFakeStats(period), [period]);
    const chartData = useMemo(() => generateFakeChartData(period), [period]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: `Biểu đồ lượt truy cập theo ${
                    period === 'day' ? 'Giờ' : 
                    period === 'week' ? 'Ngày trong Tuần' : 
                    period === 'month' ? 'Ngày trong Tháng' : 'Tháng'
                }`,
            },
        },
    };

    return (
        <div className="dashboard-view">
            <div className="dashboard-header">
                <h2>Tổng Quan Báo Cáo</h2>
                <div className="dashboard-period-selector">
                    <button onClick={() => setPeriod('day')} className={period === 'day' ? 'active' : ''}>Ngày</button>
                    <button onClick={() => setPeriod('week')} className={period === 'week' ? 'active' : ''}>Tuần</button>
                    <button onClick={() => setPeriod('month')} className={period === 'month' ? 'active' : ''}>Tháng</button>
                    <button onClick={() => setPeriod('year')} className={period === 'year' ? 'active' : ''}>Năm</button>
                </div>
            </div>

            {/* Các thẻ thông số */}
            <div className="stats-grid">
                <div className="stat-card">
                    <FiActivity className="stat-icon" style={{ color: '#3498db' }} />
                    <div className="stat-info">
                        <span className="stat-title">Lượt Truy Cập</span>
                        <span className="stat-value">{views.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <FiDollarSign className="stat-icon" style={{ color: '#2ecc71' }} />
                    <div className="stat-info">
                        <span className="stat-title">Doanh Thu (Fake)</span>
                        <span className="stat-value">{revenue.toLocaleString('vi-VN')} ₫</span>
                    </div>
                </div>
                <div className="stat-card">
                    <FiTrendingUp className="stat-icon" style={{ color: '#e67e22' }} />
                    <div className="stat-info">
                        <span className="stat-title">Xu Đã Tiêu (Fake)</span>
                        <span className="stat-value">{coinsSpent.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="chart-container">
                <Line options={chartOptions} data={chartData} />
            </div>
        </div>
    );
};

export default DashboardView;