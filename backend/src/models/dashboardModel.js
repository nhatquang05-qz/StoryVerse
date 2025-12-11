const { getConnection } = require('../db/connection');

const DashboardModel = {
  getDashboardStats: async (period) => {
    const connection = getConnection();
    
    let dateCondition = '';
    let chartDateFormat = '%Y-%m-%d'; 
    
    if (period === 'day') {
        dateCondition = 'AND DATE(o.createdAt) = CURDATE()';
        chartDateFormat = '%H:00'; 
    } else if (period === 'month') {
        dateCondition = 'AND MONTH(o.createdAt) = MONTH(CURRENT_DATE()) AND YEAR(o.createdAt) = YEAR(CURRENT_DATE())';
        chartDateFormat = '%Y-%m-%d';
    } else if (period === 'year') {
        dateCondition = 'AND YEAR(o.createdAt) = YEAR(CURRENT_DATE())';
        chartDateFormat = '%Y-%m'; 
    }

    const userDateCondition = dateCondition.replace(/o\./g, 'u.').replace(/createdAt/g, 'acc_created_at');
    const txDateCondition = dateCondition.replace(/o\./g, 't.');

    // 1. Thống kê tổng quan (Stats Cards)
    const [revenueStats] = await connection.execute(`
        SELECT COALESCE(SUM(totalAmount), 0) as revenue 
        FROM orders o 
        WHERE status IN ('PAID', 'COMPLETED', 'DELIVERED') ${dateCondition}
    `);

    const [userStats] = await connection.execute(`
        SELECT COUNT(*) as count FROM users u WHERE 1=1 ${userDateCondition}
    `);

    const [orderStats] = await connection.execute(`
        SELECT COUNT(*) as count FROM orders o WHERE 1=1 ${dateCondition}
    `);

    const [comicStats] = await connection.execute('SELECT COUNT(*) as count FROM comics');

    // 2. Biểu đồ Doanh thu (Line Chart)
    const [revenueChart] = await connection.execute(`
        SELECT DATE_FORMAT(createdAt, ?) as date, SUM(totalAmount) as total
        FROM orders o
        WHERE status IN ('PAID', 'COMPLETED', 'DELIVERED') ${dateCondition}
        GROUP BY date
        ORDER BY date ASC
    `, [chartDateFormat]);

    // 3. Biểu đồ User mới (Bar Chart)
    const [userChart] = await connection.execute(`
        SELECT DATE_FORMAT(acc_created_at, ?) as date, COUNT(*) as count
        FROM users u
        WHERE 1=1 ${userDateCondition}
        GROUP BY date
        ORDER BY date ASC
    `, [chartDateFormat]);

    // 4. Biểu đồ Đơn hàng (Doughnut/Pie) - Trả về danh sách trạng thái
    const [orderChart] = await connection.execute(`
        SELECT DATE_FORMAT(createdAt, ?) as date, COUNT(*) as count
        FROM orders o
        WHERE 1=1 ${dateCondition}
        GROUP BY date
        ORDER BY date ASC
    `, [chartDateFormat]);

    // 5. Top Truyện Bán Chạy 
    const [topComics] = await connection.execute(`
        SELECT 
            c.id, 
            c.title, 
            c.author, 
            c.coverImageUrl,
            COALESCE(SUM(oi.quantity), 0) as salesCount, -- Đã sửa thành tổng số lượng
            COALESCE(SUM(oi.price * oi.quantity), 0) as totalRevenue
        FROM order_items oi
        JOIN orders o ON oi.orderId = o.id
        JOIN comics c ON oi.comicId = c.id
        WHERE o.status IN ('PAID', 'COMPLETED', 'DELIVERED') ${dateCondition}
        GROUP BY c.id
        ORDER BY salesCount DESC
        LIMIT 5
    `);

    // 6. Giao dịch gần đây
    const [transactions] = await connection.execute(`
        SELECT 
            t.id, t.transactionCode, t.orderId, t.amount, t.status, t.type, t.createdAt,
            u.fullName as user_name
        FROM payment_transactions t
        LEFT JOIN users u ON t.userId = u.id
        ORDER BY t.createdAt DESC
        LIMIT 10
    `);

    // 7. Thống kê Thể loại (Radar)
    const [genreStats] = await connection.execute(`
        SELECT g.name, COUNT(cg.comicId) as count
        FROM genres g
        LEFT JOIN comic_genres cg ON g.id = cg.genreId
        GROUP BY g.id
        ORDER BY count DESC
        LIMIT 6
    `);

    // 8. Nguồn doanh thu (Polar Area) - Dựa trên phương thức thanh toán
    const [revenueSource] = await connection.execute(`
        SELECT paymentMethod, SUM(totalAmount) as total
        FROM orders o
        WHERE status IN ('PAID', 'COMPLETED', 'DELIVERED') ${dateCondition}
        GROUP BY paymentMethod
    `);

    return {
        stats: {
            revenue: Number(revenueStats[0].revenue),
            users: userStats[0].count,
            orders: orderStats[0].count,
            comics: comicStats[0].count
        },
        charts: {
            revenue: revenueChart,
            users: userChart,
            orders: orderChart
        },
        transactions,
        topComics,
        genreStats: {
            labels: genreStats.map(g => g.name),
            data: genreStats.map(g => g.count)
        },
        revenueSource: {
            labels: revenueSource.map(r => r.paymentMethod),
            data: revenueSource.map(r => r.total)
        }
    };
  }
};

module.exports = DashboardModel;