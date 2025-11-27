const dashboardModel = require('../models/dashboardModel');

const getDashboardData = async (req, res) => {
    try {
        const [stats, revenueChart, userChart, orderStatus, recentTransactions] = await Promise.all([
            dashboardModel.getSystemStatsRaw(),
            dashboardModel.getRevenueChartDataRaw(),
            dashboardModel.getUserGrowthChartDataRaw(),
            dashboardModel.getOrderStatusDistributionRaw(),
            dashboardModel.getRecentTransactionsRaw(10)
        ]);

        res.json({
            success: true,
            data: {
                stats,
                charts: {
                    revenue: revenueChart,
                    users: userChart,
                    orders: orderStatus
                },
                transactions: recentTransactions
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu dashboard' });
    }
};

module.exports = { getDashboardData };