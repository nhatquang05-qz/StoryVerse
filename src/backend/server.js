// server.js
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const dbConfig = {
  host: 'localhost', // Hoặc địa chỉ IP/hostname của MySQL server
  user: 'root', // Thay bằng tên user MySQL của bạn
  password: '24122005Quang#', // Thay bằng mật khẩu MySQL của bạn
  database: 'storyverse_db' // Thay bằng tên database của bạn
};

let connection;

async function connectDB() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database!');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Thoát nếu không kết nối được
  }
}

connectDB();

// --- Bảng Users (Ví dụ) ---
// CREATE TABLE users (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   name VARCHAR(255) NOT NULL,
//   email VARCHAR(255) UNIQUE NOT NULL
// );

// --- API Endpoints ---

// GET /users (Lấy tất cả user)
app.get('/users', async (req, res) => {
  try {
    const [rows] = await connection.execute('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id (Lấy user theo ID)
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await connection.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /users (Tạo user mới)
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    const [result] = await connection.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    res.status(201).json({ id: result.insertId, name, email });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ error: 'Email already exists' });
     }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /users/:id (Cập nhật user)
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
     if (!name && !email) {
       return res.status(400).json({ error: 'At least one field (name or email) is required to update' });
     }

     let query = 'UPDATE users SET ';
     const params = [];
     if (name) {
       query += 'name = ? ';
       params.push(name);
     }
     if (email) {
       query += (name ? ', ' : '') + 'email = ? ';
       params.push(email);
     }
     query += 'WHERE id = ?';
     params.push(id);

    const [result] = await connection.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found or no changes made' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
       return res.status(409).json({ error: 'Email already exists' });
     }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /users/:id (Xóa user)
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Đóng kết nối khi server tắt
process.on('SIGINT', async () => {
  if (connection) {
    await connection.end();
    console.log('Database connection closed.');
  }
  process.exit();
});