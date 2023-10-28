const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.json());

const books = [
    { id: 1, title: 'Harry Potter', borrowed: false },
    { id: 2, title: 'Lord of the Rings', borrowed: false }
];

// 设置静态文件目录，用于serve前端代码
app.use(express.static(path.join(__dirname, 'public')));

// GET: 查找书籍
app.get('/books', (req, res) => {
    res.json(books);
});

// POST: 添加新书
app.post('/books', (req, res) => {
    const newBook = {
        id: books.length + 1,
        title: req.body.title,
        borrowed: false
    };
    books.push(newBook);
    res.json(newBook);
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
