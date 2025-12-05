const { getConnection } = require('../db/connection');


const getTopContributors = async (req, res) => {
    try {
        const db = getConnection();
        
        const query = `
            SELECT 
                u.id, u.fullName, u.avatarUrl, u.level, u.levelSystem,
                ((SELECT COUNT(*) FROM posts WHERE userId = u.id) * 5 + 
                 (SELECT COUNT(*) FROM comments WHERE userId = u.id) * 2) as score
            FROM users u
            ORDER BY score DESC
            LIMIT 5
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy top thành viên' });
    }
};


const getSuggestedComics = async (req, res) => {
    try {
        const db = getConnection();
        
        const query = `
            SELECT id, title, coverImageUrl, author, viewCount 
            FROM comics 
            WHERE status = 'Ongoing' 
            ORDER BY viewCount DESC 
            LIMIT 3
        `;
        const [rows] = await db.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi lấy truyện đề cử' });
    }
};


const getUserCommunityStats = async (req, res) => {
    const userId = req.userId;
    try {
        const db = getConnection();
        const [posts] = await db.query('SELECT COUNT(*) as count FROM posts WHERE userId = ?', [userId]);
        const [likes] = await db.query('SELECT COUNT(*) as count FROM post_likes WHERE userId = ?', [userId]);
        
        res.status(200).json({
            postCount: posts[0].count,
            likeCount: likes[0].count
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy thống kê user' });
    }
};

const getMyStats = async (req, res) => {
    try {
        const userId = req.userId; 
        const stats = await userModel.getUserCommunityStatsRaw(userId);
        res.json(stats);
    } catch (error) {
        console.error('Get My Stats Error:', error);
        res.status(500).json({ error: 'Lỗi lấy thống kê' });
    }
};

module.exports = {
    getTopContributors,
    getSuggestedComics,
    getUserCommunityStats,
    getMyStats
};