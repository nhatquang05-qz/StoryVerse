const dashboardModel = require('../models/dashboardModel');

const getDashboardStats = async (req, res) => {
    try {
        const { period } = req.query; 
        const currentPeriod = period || 'day';
        const stats = await dashboardModel.getDashboardStats(currentPeriod);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy dữ liệu dashboard' });
    }
};

module.exports = { getDashboardStats };