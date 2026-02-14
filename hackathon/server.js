const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key';

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ================= DATABASE =================
const db = new sqlite3.Database('./users.db');

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  security_question TEXT,
  security_answer TEXT
)`);

db.run(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  content TEXT,
  category TEXT,
  file_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// ================= AUTH =================

app.post('/signup', (req, res) => {
  const { username, password, securityQuestion, securityAnswer } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error hashing password' });

    db.run(
      `INSERT INTO users (username, password, security_question, security_answer)
       VALUES (?, ?, ?, ?)`,
      [username, hashedPassword, securityQuestion, securityAnswer],
      function (err) {
        if (err) return res.status(400).json({ error: 'Username exists' });
        res.json({ message: 'Signup successful' });
      }
    );
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { userId: user.id },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.json({ token });
    });
  });
});

// ================= VERIFY TOKEN =================

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ error: 'No token' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    req.user = decoded;
    next();
  });
};

// ================= CREATE POST =================

app.post('/create-post', verifyToken, upload.single('file'), (req, res) => {
  const { content, category } = req.body;
  const filePath = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO posts (user_id, content, category, file_path)
     VALUES (?, ?, ?, ?)`,
    [req.user.userId, content, category, filePath],
    function (err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Post created successfully' });
    }
  );
});

// ================= GET POSTS =================

app.get('/posts', (req, res) => {
  db.all(
    `SELECT * FROM posts ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(rows);
    }
  );
});

// ================= START SERVER =================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
