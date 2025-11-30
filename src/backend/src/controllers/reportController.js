const { getConnection } = require('../db/connection');

const getDb = () => {
    try {
        return getConnection();
    } catch (error) {
        throw new Error('Database connection failed');
    }
};

const getPendingReports = async (req, res) => {
  try {
    const db = getDb();

    const [postReports] = await db.query(`
      SELECT r.id, r.reporterId, r.targetId, r.targetType, r.reason, r.createdAt, r.status,
             u.fullName as reporterName, u.avatarUrl as reporterAvatar,
             p.content as targetContent, p.imageUrl as targetImage, p.userId as reportedUserId,
             ru.fullName as reportedUserName, ru.avatarUrl as reportedUserAvatar
      FROM reports r
      LEFT JOIN users u ON r.reporterId = u.id
      LEFT JOIN posts p ON r.targetId = p.id
      LEFT JOIN users ru ON p.userId = ru.id
      WHERE r.targetType = 'POST' AND r.status = 'PENDING'
      ORDER BY r.createdAt DESC
    `);

    const [commentReports] = await db.query(`
      SELECT r.id, r.reporterId, r.targetId, r.targetType, r.reason, r.createdAt, r.status,
             u.fullName as reporterName, u.avatarUrl as reporterAvatar,
             c.content as targetContent, c.imageUrl as targetImage, c.stickerUrl as targetSticker, c.userId as reportedUserId,
             ru.fullName as reportedUserName, ru.avatarUrl as reportedUserAvatar
      FROM reports r
      LEFT JOIN users u ON r.reporterId = u.id
      LEFT JOIN comments c ON r.targetId = c.id
      LEFT JOIN users ru ON c.userId = ru.id
      WHERE r.targetType = 'COMMENT' AND r.status = 'PENDING'
      ORDER BY r.createdAt DESC
    `);

    res.status(200).json({
      posts: postReports,
      comments: commentReports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo' });
  }
};

// Xóa nội dung vi phạm (Bài viết hoặc Bình luận)
const deleteContent = async (req, res) => {
  const { reportId } = req.params;
  const db = getDb();
  
  try {
    await db.beginTransaction();

    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (reports.length === 0) {
      await db.rollback();
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }
    const report = reports[0];

    // Xóa nội dung gốc
    if (report.targetType === 'POST') {
      await db.query('DELETE FROM posts WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'COMMENT') {
      await db.query('DELETE FROM comments WHERE id = ?', [report.targetId]);
    }

    // Cập nhật trạng thái báo cáo
    await db.query('UPDATE reports SET status = "RESOLVED" WHERE id = ?', [reportId]);

    await db.commit();
    res.status(200).json({ message: 'Đã xóa nội dung vi phạm thành công' });
  } catch (error) {
    await db.rollback();
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Lỗi khi xóa nội dung' });
  }
};

// Ban User và Xóa nội dung
const banUserAndDeleteContent = async (req, res) => {
  const { reportId } = req.params;
  const db = getDb();

  try {
    await db.beginTransaction();

    const [reports] = await db.query('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (reports.length === 0) {
      await db.rollback();
      return res.status(404).json({ message: 'Không tìm thấy báo cáo' });
    }
    const report = reports[0];
    let reportedUserId = null;

    // Lấy ID người bị báo cáo và xóa nội dung
    if (report.targetType === 'POST') {
      const [posts] = await db.query('SELECT userId FROM posts WHERE id = ?', [report.targetId]);
      if (posts.length > 0) reportedUserId = posts[0].userId;
      await db.query('DELETE FROM posts WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'COMMENT') {
      const [comments] = await db.query('SELECT userId FROM comments WHERE id = ?', [report.targetId]);
      if (comments.length > 0) reportedUserId = comments[0].userId;
      await db.query('DELETE FROM comments WHERE id = ?', [report.targetId]);
    }

    // Ban user (Cập nhật isBanned = 1)
    if (reportedUserId) {
      await db.query('UPDATE users SET isBanned = 1 WHERE id = ?', [reportedUserId]);
    }

    // Cập nhật trạng thái báo cáo
    await db.query('UPDATE reports SET status = "RESOLVED" WHERE id = ?', [reportId]);

    await db.commit();
    res.status(200).json({ message: 'Đã ban người dùng và xóa nội dung' });
  } catch (error) {
    await db.rollback();
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý ban user' });
  }
};

// Bỏ qua báo cáo (Không vi phạm)
const dismissReport = async (req, res) => {
    const { reportId } = req.params;
    const db = getDb();
    try {
        await db.query('UPDATE reports SET status = "REJECTED" WHERE id = ?', [reportId]);
        res.status(200).json({ message: 'Đã bỏ qua báo cáo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
}

module.exports = {
  getPendingReports,
  deleteContent,
  banUserAndDeleteContent,
  dismissReport
};