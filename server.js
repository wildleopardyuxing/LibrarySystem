const express = require('express');
const multer = require('multer');
const path = require('path');

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

// 固定设定初始的书籍列表
const books = [
    { id: 1, title: 'Harry Potter and the Philosopher\'s Stone', borrowed: false, cover: '1698490027264.jpg'},
    { id: 2, title: 'The Lord of the Rings: The Fellowship of the Ring', borrowed: false, cover: '1698490863207.jpeg'}
];

// GET: 查找书籍
app.get('/books', (req, res) => {
    res.json(books);
});

// POST: 添加新书
app.post('/books', upload.single('bookCover'), (req, res) => {
    const title = req.body.title;
    const coverFilename = req.file ? path.basename(req.file.path) : null;

    const newBook = {
        id: books.length + 1,
        title: title,
        borrowed: false,
        cover: coverFilename
    };
    
    books.push(newBook);
    res.json({ message: 'Book added successfully!', newBook });
});

// PUT: 借书
app.put('/books/:id/borrow', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book && !book.borrowed) {
        book.borrowed = true;
        res.json(book);
    } else {
        res.status(400).json({ message: 'Book not found or already borrowed' });
    }
});

// PUT: 还书
app.put('/books/:id/return', (req, res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book && book.borrowed) {
        book.borrowed = false;
        res.json(book);
    } else {
        res.status(400).json({ message: 'Book not found or not borrowed' });
    }
});

// DELETE: 删除书籍
app.delete('/books/:id', (req, res) => {
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        res.json({ message: 'Book deleted successfully' });
    } else {
        res.status(400).json({ message: 'Book not found' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
