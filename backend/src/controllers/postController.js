const { getConnection } = require('../db/connection');
const Notification = require('../models/notificationModel'); 
async function getActorInfo(connection, userId) {
    const [rows] = await connection.execute('SELECT fullName, avatarUrl FROM users WHERE id = ?', [userId]);
    return rows[0] || { fullName: 'Ai đó', avatarUrl: null };
}

const getPosts = async (req, res) => {
    try {
        const connection = getConnection();
        const currentUserId = req.userId || 0; 
        const query = `
            SELECT 
                p.*, 
                u.fullName as userName, 
                u.avatarUrl as avatar,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id) as likeCount,
                (SELECT COUNT(*) FROM comments WHERE postId = p.id) as commentCount,
                (SELECT COUNT(*) FROM post_likes WHERE postId = p.id AND userId = ?) as isLiked
            FROM posts p
            JOIN users u ON p.userId = u.id
            ORDER BY p.createdAt DESC
        `;
        const [rows] = await connection.execute(query, [currentUserId]);
        const posts = rows.map(post => ({ ...post, isLiked: post.isLiked > 0 }));
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

const createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        const userId = req.userId;
        const connection = getConnection();
        const [result] = await connection.execute(
            'INSERT INTO posts (userId, content, imageUrl) VALUES (?, ?, ?)',
            [userId, content, imageUrl || null]
        );
        const [newPost] = await connection.execute(
            `SELECT p.*, u.fullName as userName, u.avatarUrl as avatar
             FROM posts p JOIN users u ON p.userId = u.id WHERE p.id = ?`, 
            [result.insertId]
        );
        res.status(201).json({ ...newPost[0], likeCount: 0, commentCount: 0, isLiked: false });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng bài' });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.userId;
        const connection = getConnection();
        const [check] = await connection.execute('SELECT id FROM post_likes WHERE postId = ? AND userId = ?', [id, userId]);
        
        if (check.length > 0) {
            await connection.execute('DELETE FROM post_likes WHERE postId = ? AND userId = ?', [id, userId]);
            res.status(200).json({ message: 'Unliked', isLiked: false });
        } else {
            await connection.execute('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [id, userId]);
            res.status(200).json({ message: 'Liked', isLiked: true });

            const [post] = await connection.execute('SELECT userId FROM posts WHERE id = ?', [id]);
            
            if (post.length > 0 && post[0].userId !== userId) {
                const actor = await getActorInfo(connection, userId);
                await Notification.create({
                    userId: post[0].userId, 
                    type: 'COMMUNITY',
                    title: 'Tương tác mới',
                    message: `<b>${actor.fullName}</b> đã thích bài viết của bạn.`,
                    referenceId: parseInt(id),
                    referenceType: 'POST',
                    imageUrl: actor.avatarUrl
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi like' });
    }
};

const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const connection = getConnection();
        const [post] = await connection.execute('SELECT userId FROM posts WHERE id = ?', [id]);
        
        if (post.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài viết' });
        
        if (post[0].userId !== userId) {
            return res.status(403).json({ message: 'Bạn không có quyền xoá bài viết này' });
        }

        await connection.execute('DELETE FROM posts WHERE id = ?', [id]);
        res.status(200).json({ message: 'Đã xoá bài viết' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xoá bài' });
    }
};

const getComments = async (req, res) => {
    try {
        const { id } = req.params; 
        let currentUserId = 0;
        if (req.headers.authorization) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const jwt = require('jsonwebtoken');
                const { JWT_SECRET } = require('../config/appConfig');
                currentUserId = jwt.verify(token, JWT_SECRET).id;
            } catch (e) {}
        }

        const connection = getConnection();
        const query = `
            SELECT 
                c.*, 
                u.fullName as userName, 
                u.avatarUrl as avatar,
                (SELECT COUNT(*) FROM comment_likes WHERE commentId = c.id) as likeCount,
                (SELECT COUNT(*) FROM comment_likes WHERE commentId = c.id AND userId = ?) as isLiked
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.postId = ?
            ORDER BY c.createdAt ASC
        `;
        const [rows] = await connection.execute(query, [currentUserId, id]);
        const comments = rows.map(c => ({ ...c, isLiked: c.isLiked > 0 }));
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi lấy bình luận' });
    }
};

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, imageUrl, stickerUrl, parentId } = req.body;
        const userId = req.userId;
        const connection = getConnection();

        const [result] = await connection.execute(
            'INSERT INTO comments (postId, userId, content, imageUrl, stickerUrl, parentId) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, content || '', imageUrl || null, stickerUrl || null, parentId || null]
        );

        const [newComment] = await connection.execute(`
            SELECT c.*, u.fullName as userName, u.avatarUrl as avatar
            FROM comments c
            JOIN users u ON c.userId = u.id
            WHERE c.id = ?
        `, [result.insertId]);

        res.status(201).json({ ...newComment[0], likeCount: 0, isLiked: false });

        try {
            const actor = await getActorInfo(connection, userId);
            
            if (parentId) {
                const [parentCmt] = await connection.execute('SELECT userId FROM comments WHERE id = ?', [parentId]);
                
                // Nếu người được trả lời tồn tại và không phải là chính mình
                if (parentCmt.length > 0 && parentCmt[0].userId !== userId) {
                    await Notification.create({
                        userId: parentCmt[0].userId,
                        type: 'COMMUNITY',
                        title: 'Phản hồi mới',
                        message: `<b>${actor.fullName}</b> đã trả lời bình luận của bạn.`,
                        referenceId: parseInt(id), // Link về bài viết chứa cmt
                        referenceType: 'POST',
                        imageUrl: actor.avatarUrl
                    });
                }
            } else {
                const [post] = await connection.execute('SELECT userId FROM posts WHERE id = ?', [id]);
                
                if (post.length > 0 && post[0].userId !== userId) {
                    await Notification.create({
                        userId: post[0].userId,
                        type: 'COMMUNITY',
                        title: 'Bình luận mới',
                        message: `<b>${actor.fullName}</b> đã bình luận về bài viết của bạn.`,
                        referenceId: parseInt(id),
                        referenceType: 'POST',
                        imageUrl: actor.avatarUrl
                    });
                }
            }
        } catch (notifErr) {
            console.error("Lỗi tạo thông báo comment:", notifErr);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi gửi bình luận' });
    }
};

const toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        const connection = getConnection();
        const [check] = await connection.execute('SELECT id FROM comment_likes WHERE commentId = ? AND userId = ?', [commentId, userId]);
        
        if (check.length > 0) {
            await connection.execute('DELETE FROM comment_likes WHERE commentId = ? AND userId = ?', [commentId, userId]);
            res.status(200).json({ message: 'Unliked', isLiked: false });
        } else {
            await connection.execute('INSERT INTO comment_likes (commentId, userId) VALUES (?, ?)', [commentId, userId]);
            res.status(200).json({ message: 'Liked', isLiked: true });

            try {
                const [cmt] = await connection.execute('SELECT userId, postId FROM comments WHERE id = ?', [commentId]);
                
                if (cmt.length > 0 && cmt[0].userId !== userId) {
                    const actor = await getActorInfo(connection, userId);
                    await Notification.create({
                        userId: cmt[0].userId,
                        type: 'COMMUNITY',
                        title: 'Tương tác mới',
                        message: `<b>${actor.fullName}</b> đã thích bình luận của bạn.`,
                        referenceId: cmt[0].postId,
                        referenceType: 'POST',
                        imageUrl: actor.avatarUrl
                    });
                }
            } catch (notifErr) {
                console.error("Lỗi tạo thông báo like comment:", notifErr);
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi like comment' });
    }
};

const reportPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.userId;
        const connection = getConnection();

        const [posts] = await connection.execute(
            'SELECT content, imageUrl FROM posts WHERE id = ?', 
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Bài viết không tồn tại hoặc đã bị xoá trước đó.' });
        }

        const postSnapshot = posts[0];

        await connection.execute(
            `INSERT INTO reports 
            (reporterId, targetId, targetType, reason, snapshotContent, snapshotImage) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                id, 
                'POST', 
                reason, 
                postSnapshot.content || '',   
                postSnapshot.imageUrl || null 
            ]
        );

        res.status(200).json({ message: 'Đã gửi báo cáo bài viết. Nội dung đã được lưu lại để xem xét.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi báo cáo' });
    }
};

const reportComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { reason } = req.body;
        const userId = req.userId;
        const connection = getConnection();

        const [comments] = await connection.execute(
            'SELECT content, imageUrl, stickerUrl FROM comments WHERE id = ?', 
            [commentId]
        );

        if (comments.length === 0) {
            return res.status(404).json({ message: 'Bình luận không tồn tại.' });
        }

        const cmtSnapshot = comments[0];
        const snapshotImg = cmtSnapshot.imageUrl || cmtSnapshot.stickerUrl || null;

        await connection.execute(
            `INSERT INTO reports 
            (reporterId, targetId, targetType, reason, snapshotContent, snapshotImage) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId, 
                commentId, 
                'COMMENT', 
                reason, 
                cmtSnapshot.content || '', 
                snapshotImg
            ]
        );

        res.status(200).json({ message: 'Đã gửi báo cáo bình luận.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi báo cáo' });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;
        const connection = getConnection();

        const [cmt] = await connection.execute('SELECT userId FROM comments WHERE id = ?', [commentId]);
        if (cmt.length === 0) return res.status(404).json({ message: 'Comment not found' });

        if (cmt[0].userId !== userId) {
            return res.status(403).json({ message: 'Không được xoá bình luận của người khác' });
        }

        await connection.execute('DELETE FROM comments WHERE id = ?', [commentId]);
        res.status(200).json({ message: 'Đã xoá bình luận' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xoá bình luận' });
    }
};

module.exports = {
    getPosts, createPost, toggleLike, deletePost,
    getComments, addComment, toggleCommentLike, deleteComment,
    reportPost, reportComment
};