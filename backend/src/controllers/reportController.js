const { getConnection } = require('../db/connection');

const getDb = () => {
    try {
        return getConnection();
    } catch (error) {
        throw new Error('Database connection failed');
    }
};


const createReport = async (req, res) => {
  const { targetId, targetType, reason } = req.body;
  const reporterId = req.userId; 

  if (!targetId || !targetType || !reason) {
    return res.status(400).json({ message: 'Thiếu thông tin báo cáo' });
  }

  try {
    const db = getDb();
    let snapshotContent = '';
    let snapshotImage = null;

    
    if (targetType === 'CHAT_MESSAGE') {
      const [chats] = await db.query(
        'SELECT message, imageUrl, stickerUrl FROM chat_messages WHERE id = ?', 
        [targetId]
      );
      
      if (chats.length === 0) {
        return res.status(404).json({ message: 'Tin nhắn không tồn tại hoặc đã bị xóa.' });
      }
      
      snapshotContent = chats[0].message || '';
      
      snapshotImage = chats[0].imageUrl || chats[0].stickerUrl || null;
    }

    
    await db.query(
      `INSERT INTO reports 
       (reporterId, targetId, targetType, reason, status, snapshotContent, snapshotImage) 
       VALUES (?, ?, ?, ?, 'PENDING', ?, ?)`,
      [reporterId, targetId, targetType, reason, snapshotContent, snapshotImage]
    );

    res.status(201).json({ message: 'Gửi báo cáo thành công' });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo báo cáo' });
  }
};

const getPendingReports = async (req, res) => {
  try {
    const db = getDb();

    
    const [postReports] = await db.query(`
      SELECT r.id, r.reporterId, r.targetId, r.targetType, r.reason, r.createdAt, r.status,
             u.fullName as reporterName, u.avatarUrl as reporterAvatar,
             r.snapshotContent as targetContent, r.snapshotImage as targetImage, 
             p.userId as reportedUserId,
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
             r.snapshotContent as targetContent, r.snapshotImage as targetImage, 
             c.userId as reportedUserId,
             ru.fullName as reportedUserName, ru.avatarUrl as reportedUserAvatar
      FROM reports r
      LEFT JOIN users u ON r.reporterId = u.id
      LEFT JOIN comments c ON r.targetId = c.id
      LEFT JOIN users ru ON c.userId = ru.id
      WHERE r.targetType = 'COMMENT' AND r.status = 'PENDING'
      ORDER BY r.createdAt DESC
    `);

    
    const [chatReports] = await db.query(`
      SELECT r.id, r.reporterId, r.targetId, r.targetType, r.reason, r.createdAt, r.status,
             u.fullName as reporterName, u.avatarUrl as reporterAvatar,
             r.snapshotContent as targetContent, r.snapshotImage as targetImage, 
             cm.userId as reportedUserId,
             ru.fullName as reportedUserName, ru.avatarUrl as reportedUserAvatar
      FROM reports r
      LEFT JOIN users u ON r.reporterId = u.id
      LEFT JOIN chat_messages cm ON r.targetId = cm.id
      LEFT JOIN users ru ON cm.userId = ru.id
      WHERE r.targetType = 'CHAT_MESSAGE' AND r.status = 'PENDING'
      ORDER BY r.createdAt DESC
    `);

    res.status(200).json({
      posts: postReports,
      comments: commentReports,
      chatMessages: chatReports 
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách báo cáo' });
  }
};

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

    if (report.targetType === 'POST') {
      await db.query('DELETE FROM posts WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'COMMENT') {
      await db.query('DELETE FROM comments WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'CHAT_MESSAGE') {
      await db.query('DELETE FROM chat_messages WHERE id = ?', [report.targetId]);
    }

    await db.query('UPDATE reports SET status = "RESOLVED" WHERE id = ?', [reportId]);

    await db.commit();
    res.status(200).json({ message: 'Đã xóa nội dung vi phạm thành công' });
  } catch (error) {
    await db.rollback();
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Lỗi khi xóa nội dung' });
  }
};

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

    if (report.targetType === 'POST') {
      const [posts] = await db.query('SELECT userId FROM posts WHERE id = ?', [report.targetId]);
      if (posts.length > 0) reportedUserId = posts[0].userId;
      await db.query('DELETE FROM posts WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'COMMENT') {
      const [comments] = await db.query('SELECT userId FROM comments WHERE id = ?', [report.targetId]);
      if (comments.length > 0) reportedUserId = comments[0].userId;
      await db.query('DELETE FROM comments WHERE id = ?', [report.targetId]);
    } else if (report.targetType === 'CHAT_MESSAGE') {
      const [chats] = await db.query('SELECT userId FROM chat_messages WHERE id = ?', [report.targetId]);
      if (chats.length > 0) reportedUserId = chats[0].userId;
      await db.query('DELETE FROM chat_messages WHERE id = ?', [report.targetId]);
    }

    if (reportedUserId) {
      await db.query('UPDATE users SET isBanned = 1 WHERE id = ?', [reportedUserId]);
    }

    await db.query('UPDATE reports SET status = "RESOLVED" WHERE id = ?', [reportId]);

    await db.commit();
    res.status(200).json({ message: 'Đã ban người dùng và xóa nội dung' });
  } catch (error) {
    await db.rollback();
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý ban user' });
  }
};

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
  createReport,
  getPendingReports,
  deleteContent,
  banUserAndDeleteContent,
  dismissReport
};