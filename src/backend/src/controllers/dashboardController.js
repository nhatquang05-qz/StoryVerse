const dashboardModel = require('../models/dashboardModel');
const comicModel = require('../models/comicModel');

const getDashboardData = async (req, res) => {
    try {
        const { period = 'day' } = req.query; 

        const [stats, revenueChart, userChart, orderStatus, recentTransactions, topSellingComics] = await Promise.all([
            dashboardModel.getSystemStatsRaw(),
            dashboardModel.getRevenueChartDataRaw(period), 
            dashboardModel.getUserGrowthChartDataRaw(period),
            dashboardModel.getOrderStatusDistributionRaw(),
            dashboardModel.getRecentTransactionsRaw(10),
            comicModel.getTopSellingComicsRaw ? comicModel.getTopSellingComicsRaw(5) : [] 
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
                transactions: recentTransactions,
                topComics: topSellingComics
            }
        });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ success: false, message: 'Lỗi lấy dữ liệu dashboard' });
    }
};

module.exports = { getDashboardData };