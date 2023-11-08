const express = require('express');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();

// 设置静态文件目录，用于serve前端代码
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 为封面设置存储路径和文件名
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 初始化数据库连接
const db = new sqlite3.Database('./library.db', (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Connected to the library database.');
});

// GET: 查找书籍
app.get('/books', (req, res) => {
    db.all('SELECT * FROM Books', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST: 添加新书
app.post('/books', upload.single('bookCover'), (req, res) => {
    const coverFilename = req.file ? path.basename(req.file.path) : null;

    const newBook = {
        title: req.body.title,
        author: req.body.author,
        publisher: req.body.publisher,
        year: req.body.year,
        floor: req.body.floor,
        bookshelf: req.body.bookshelf,
        borrowedDate: null,
        cover: coverFilename
    };
    
    const sql = `INSERT INTO Books (title, author, publisher, year, floor, bookshelf, borrowedDate, cover) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [newBook.title, newBook.author, newBook.publisher, newBook.year, newBook.floor, newBook.bookshelf, newBook.borrowedDate, newBook.cover];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        newBook.id = this.lastID; // 获取新插入行的ID
        res.json({ message: 'Book added successfully!', newBook });
    });
});

// PUT: 借书
app.put('/books/:id/borrow', (req, res) => {
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const sql = `UPDATE Books SET borrowedDate = ? WHERE id = ? AND borrowedDate IS NULL`;
    const params = [getCurrentDate(), req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(400).json({ message: 'Book not found or already borrowed' });
        } else {
            res.json({ message: 'Book borrowed successfully' });
        }
    });
});

// PUT: 还书
app.put('/books/:id/return', (req, res) => {
    const sql = `UPDATE Books SET borrowedDate = NULL WHERE id = ? AND borrowedDate IS NOT NULL`;
    const params = [req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(400).json({ message: 'Book not found or not borrowed' });
        } else {
            res.json({ message: 'Book returned successfully' });
        }
    });
});

// DELETE: 删除书籍
app.delete('/books/:id', (req, res) => {
    const sql = `DELETE FROM Books WHERE id = ?`;
    const params = [req.params.id];

    db.run(sql, params, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (this.changes === 0) {
            res.status(400).json({ message: 'Book not found' });
        } else {
            res.json({ message: 'Book deleted successfully' });
        }
    });
});

// 监听端口
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// 关闭数据库连接
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
});
