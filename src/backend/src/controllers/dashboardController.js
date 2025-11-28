const dashboardModel = require('../models/dashboardModel');

const getDashboardStats = async (req, res) => {
    try {
        const { period } = req.query; 
        const currentPeriod = period || 'day';

        const [
            stats, 
            revenueChart, 
            userChart, 
            orderChart, 
            topComics, 
            transactions,
            genreStats,
            revenueSources
        ] = await Promise.all([
            dashboardModel.getStats(currentPeriod),
            dashboardModel.getRevenueChart(currentPeriod),
            dashboardModel.getUserChart(currentPeriod),
            dashboardModel.getOrderChart(currentPeriod),       
            dashboardModel.getTopComics(currentPeriod),        
            dashboardModel.getRecentTransactions(currentPeriod), 
            dashboardModel.getGenreStats(),                  
            dashboardModel.getRevenueSources(currentPeriod)  
        ]);

        const genreData = {
            labels: genreStats.map(g => g.name),
            data: genreStats.map(g => g.count)
        };

        const revenueSourceData = {
            labels: revenueSources.map(r => {
                const type = r.type ? r.type.toUpperCase() : '';
                if (['DEPOSIT', 'RECHARGE', 'NAP_XU'].includes(type)) return 'Nạp Xu';
                if (['PURCHASE', 'BUY', 'MUA_TRUYEN'].includes(type)) return 'Mua Truyện';
                if (['VIP', 'SUBSCRIBE'].includes(type)) return 'Gói VIP';
                return r.type;
            }),
            data: revenueSources.map(r => r.total)
        };

        res.json({
            success: true,
            data: {
                stats,
                charts: {
                    revenue: revenueChart,
                    users: userChart,
                    orders: orderChart
                },
                topComics,
                transactions,
                genreStats: genreData,
                revenueSource: revenueSourceData
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu dashboard' });
    }
};

module.exports = { getDashboardStats };