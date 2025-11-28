const { getConnection } = require('../db/connection');

const getTimeFilter = (period, columnName = 'createdAt') => {
    if (period === 'day') return `AND DATE(${columnName}) = CURDATE()`;
    if (period === 'month') return `AND MONTH(${columnName}) = MONTH(CURRENT_DATE()) AND YEAR(${columnName}) = YEAR(CURRENT_DATE())`;
    if (period === 'year') return `AND YEAR(${columnName}) = YEAR(CURRENT_DATE())`;
    return '';
};

// 1. Thống kê tổng quan (Card Stats)
const getStats = async (period) => {
    const connection = getConnection();
    const timeFilter = getTimeFilter(period, 'createdAt');
    const userTimeFilter = getTimeFilter(period, 'acc_created_at');

    const [revenue] = await connection.execute(
        `SELECT COALESCE(SUM(amount), 0) as total FROM payment_transactions WHERE status = 'SUCCESS' ${timeFilter}`
    );
    
    const [users] = await connection.execute(
        `SELECT COUNT(*) as count FROM users WHERE 1=1 ${userTimeFilter}`
    );
    
    const [orders] = await connection.execute(
        `SELECT COUNT(*) as count FROM orders WHERE UPPER(status) IN ('SUCCESS', 'COMPLETED', 'PAID') ${timeFilter}`
    );
    
    const [comics] = await connection.execute(
        `SELECT COUNT(*) as count FROM comics` 
    );

    return {
        revenue: Number(revenue[0].total),
        users: users[0].count,
        orders: orders[0].count,
        comics: comics[0].count
    };
};

// 2. Biểu đồ Doanh thu (Line Chart)
const getRevenueChart = async (period) => {
    const connection = getConnection();
    let query = '';

    if (period === 'day') {
        // 7 ngày gần nhất
        query = `
            SELECT DATE_FORMAT(createdAt, '%d/%m') as date, SUM(amount) as total 
            FROM payment_transactions 
            WHERE status = 'SUCCESS' AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE_FORMAT(createdAt, '%d/%m') 
            ORDER BY MIN(createdAt) ASC`;
    } else if (period === 'month') {
        // Trong tháng hiện tại (nhóm theo ngày)
        query = `
            SELECT DATE_FORMAT(createdAt, '%d/%m') as date, SUM(amount) as total 
            FROM payment_transactions 
            WHERE status = 'SUCCESS' AND MONTH(createdAt) = MONTH(CURRENT_DATE()) AND YEAR(createdAt) = YEAR(CURRENT_DATE())
            GROUP BY DATE_FORMAT(createdAt, '%d/%m') 
            ORDER BY MIN(createdAt) ASC`;
    } else {
        // Trong năm hiện tại (nhóm theo tháng)
        query = `
            SELECT DATE_FORMAT(createdAt, '%m/%Y') as date, SUM(amount) as total 
            FROM payment_transactions 
            WHERE status = 'SUCCESS' AND YEAR(createdAt) = YEAR(CURRENT_DATE())
            GROUP BY DATE_FORMAT(createdAt, '%m/%Y')
            ORDER BY MIN(createdAt) ASC`;
    }

    const [rows] = await connection.execute(query);
    return rows;
};

// 3. Biểu đồ User mới (Bar Chart)
const getUserChart = async (period) => {
    const connection = getConnection();
    let query = '';
    
    if (period === 'day') {
         query = `
            SELECT DATE_FORMAT(acc_created_at, '%d/%m') as date, COUNT(*) as count 
            FROM users 
            WHERE acc_created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE_FORMAT(acc_created_at, '%d/%m')
            ORDER BY MIN(acc_created_at) ASC`;
    } else if (period === 'month') {
        query = `
            SELECT DATE_FORMAT(acc_created_at, '%d/%m') as date, COUNT(*) as count 
            FROM users 
            WHERE MONTH(acc_created_at) = MONTH(CURRENT_DATE()) AND YEAR(acc_created_at) = YEAR(CURRENT_DATE())
            GROUP BY DATE_FORMAT(acc_created_at, '%d/%m')
            ORDER BY MIN(acc_created_at) ASC`;
    } else {
        // SỬA: GROUP BY DATE_FORMAT(acc_created_at, '%m/%Y')
        query = `
            SELECT DATE_FORMAT(acc_created_at, '%m/%Y') as date, COUNT(*) as count 
            FROM users 
            WHERE YEAR(acc_created_at) = YEAR(CURRENT_DATE())
            GROUP BY DATE_FORMAT(acc_created_at, '%m/%Y')
            ORDER BY MIN(acc_created_at) ASC`;
    }
    const [rows] = await connection.execute(query);
    return rows;
};

// 4. Biểu đồ trạng thái đơn hàng (Doughnut)
const getOrderChart = async (period) => {
    const connection = getConnection();
    const timeFilter = getTimeFilter(period, 'createdAt');
    const [rows] = await connection.execute(
        `SELECT status, COUNT(*) as count FROM orders WHERE 1=1 ${timeFilter} GROUP BY status`
    );
    return rows;
};

// 5. Top truyện bán chạy (Table)
const getTopComics = async (period) => {
    const connection = getConnection();
    const timeFilter = getTimeFilter(period, 'o.createdAt');
    
    const query = `
        SELECT c.id, c.title, c.author, c.coverImageUrl,
               COUNT(oi.id) as salesCount,
               COALESCE(SUM(oi.price), 0) as totalRevenue
        FROM comics c
        JOIN order_items oi ON c.id = oi.comicId
        JOIN orders o ON oi.orderId = o.id
        WHERE UPPER(o.status) IN ('SUCCESS', 'COMPLETED', 'PAID') ${timeFilter}
        GROUP BY c.id, c.title, c.author, c.coverImageUrl
        ORDER BY salesCount DESC, totalRevenue DESC
        LIMIT 5
    `;
    const [rows] = await connection.execute(query);
    return rows;
};

// 6. Giao dịch gần đây (Table)
const getRecentTransactions = async (period) => {
    const connection = getConnection();
    const timeFilter = getTimeFilter(period, 't.createdAt');

    const query = `
        SELECT t.id, u.fullName as userName, t.type, t.amount, t.status, t.createdAt
        FROM payment_transactions t
        LEFT JOIN users u ON t.userId = u.id
        WHERE 1=1 ${timeFilter}
        ORDER BY t.createdAt DESC
        LIMIT 10
    `;
    const [rows] = await connection.execute(query);
    return rows;
};

// 7. Thống kê thể loại (Radar Chart)
const getGenreStats = async () => {
    const connection = getConnection();
    const query = `
        SELECT g.name, COUNT(cg.comicId) as count
        FROM genres g
        LEFT JOIN comic_genres cg ON g.id = cg.genreId
        GROUP BY g.id, g.name
        ORDER BY count DESC
        LIMIT 6
    `;
    const [rows] = await connection.execute(query);
    return rows;
};

// 8. Nguồn doanh thu (Polar Chart)
const getRevenueSources = async (period) => {
    const connection = getConnection();
    const timeFilter = getTimeFilter(period, 'createdAt');
    const query = `
        SELECT type, SUM(amount) as total
        FROM payment_transactions
        WHERE status = 'SUCCESS' ${timeFilter}
        GROUP BY type
    `;
    const [rows] = await connection.execute(query);
    return rows;
};

module.exports = { 
    getStats, 
    getRevenueChart, 
    getUserChart, 
    getOrderChart, 
    getTopComics, 
    getRecentTransactions, 
    getGenreStats, 
    getRevenueSources 
};