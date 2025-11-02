const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/appConfig');
const { getConnection } = require('../db/connection');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403);
    }
    req.userId = user.id;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
    authenticateToken(req, res, async () => {
        try {
            const connection = getConnection();
            const [rows] = await connection.execute('SELECT email FROM users WHERE id = ?', [req.userId]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Admin user not found' });
            }

            const userEmail = rows[0].email;
            
            if (userEmail === 'admin@123') {
                next();
            } else {
                return res.status(403).json({ error: 'Access denied. Admin role required.' });
            }

        } catch (error) {
            console.error("Admin authentication error:", error);
            res.status(500).json({ error: 'Failed to verify admin status' });
        }
    });
};

module.exports = { authenticateToken, authenticateAdmin };