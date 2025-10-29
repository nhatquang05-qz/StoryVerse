const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/appConfig');

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

module.exports = { authenticateToken };