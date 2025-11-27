const { getConnection } = require('../db/connection');

// Lấy tổng quan (Cards)
const getSystemStatsRaw = async () => {
    const connection = getConnection();
    
    // 1. Tổng doanh thu (chỉ tính giao dịch thành công)
    const [revenueRows] = await connection.execute(
        "SELECT SUM(amount) as totalRevenue FROM payment_transactions WHERE status = 'success'"
    );
    
    // 2. Tổng thành viên
    const [userRows] = await connection.execute(
        "SELECT COUNT(*) as totalUsers FROM users"
    );

    // 3. Tổng đơn hàng 
    const [orderRows] = await connection.execute(
        "SELECT COUNT(*) as totalOrders FROM payment_transactions"
    );

    // 4. Tổng truyện
    const [comicRows] = await connection.execute(
        "SELECT COUNT(*) as totalComics FROM comics"
    );

    return {
        revenue: revenueRows[0].totalRevenue || 0,
        users: userRows[0].totalUsers || 0,
        orders: orderRows[0].totalOrders || 0,
        comics: comicRows[0].totalComics || 0
    };
};

// Biểu đồ: Doanh thu theo thời gian
const getRevenueChartDataRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') as date, SUM(amount) as total
        FROM payment_transactions 
        WHERE status = 'success'
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
        ORDER BY date ASC
        LIMIT 30
    `);
    return rows;
};

// Biểu đồ: Tăng trưởng thành viên mới
const getUserGrowthChartDataRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT DATE_FORMAT(acc_created_at, '%Y-%m-%d') as date, COUNT(*) as count
        FROM users
        GROUP BY DATE_FORMAT(acc_created_at, '%Y-%m-%d')
        ORDER BY date ASC
        LIMIT 30
    `);
    return rows;
};

// Biểu đồ: Trạng thái đơn hàng
const getOrderStatusDistributionRaw = async () => {
    const connection = getConnection();
    const [rows] = await connection.execute(`
        SELECT status, COUNT(*) as count 
        FROM orders 
        GROUP BY status
    `);
    return rows;
};

// Bảng: Giao dịch gần nhất
const getRecentTransactionsRaw = async (limit = 10) => {
    const connection = getConnection();
    const safeLimit = Number(limit) || 10; 

    const [rows] = await connection.execute(`
        SELECT t.id, t.amount, t.status, t.type, t.createdAt, u.fullName as userName
        FROM payment_transactions t
        LEFT JOIN users u ON t.userId = u.id
        ORDER BY t.createdAt DESC
        LIMIT ${safeLimit}
    `);
    return rows;
};

module.exports = {
    getSystemStatsRaw,
    getRevenueChartDataRaw,
    getUserGrowthChartDataRaw,
    getOrderStatusDistributionRaw,
    getRecentTransactionsRaw
};