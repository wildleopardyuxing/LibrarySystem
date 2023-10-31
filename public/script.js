// Get（查）: 获取所有的书本，并显示成列表形式，右侧有操作按钮
async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    for (let book of books) {
        const bookItem = document.createElement('div');
        bookItem.className = 'bookItem';
        bookItem.innerHTML = `
            <img src="/uploads/${book.cover}" alt="${book.title} cover">
            <div class='bookInfo'>
                <div class='title'>书名：${book.title}</div>
                <div class='author'>作者：${book.author}</div>
                <div class='publisher'>出版社：${book.publisher}</div>
                <div class='year'>出版年份：${book.year}</div>
                <div class='location'>馆藏位置：楼层${book.location.floor}，书架${book.location.bookshelf}</div>
                <div class='borrowInfo'>借阅信息：${book.borrowedDate ? book.borrowedDate : '在馆'}</div>
            </div>
            <div class='action'>
                <button onclick="borrowBook(${book.id})" ${book.borrowedDate ? ' disabled' : ''}>设置借阅</button>
                <button onclick="returnBook(${book.id})" ${book.borrowedDate ? '' : 'disabled'}>设置归还</button>
                <button onclick="deleteBook(${book.id})">删除书籍</button>
            </div>
        `;
        bookList.appendChild(bookItem);
    }
}

// Post（增）: 增加新书，提交信息到后台并保存
async function addBook() {
    const cover = document.getElementById('book-cover').files[0];
    const title = document.getElementById('new-book-title').value;
    const author = document.getElementById('new-book-author').value;
    const publisher = document.getElementById('new-book-publisher').value;
    const year = document.getElementById('new-book-year').value;
    const floor = document.getElementById('new-book-floor').value;
    const bookshelf = document.getElementById('new-book-bookshelf').value;

    const formData = new FormData();
    formData.append('bookCover', cover);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('publisher', publisher);
    formData.append('year', year);
    formData.append('floor', floor);
    formData.append('bookshelf', bookshelf);

    await fetch('/books', {
        method: 'POST',
        body: formData
    });
    fetchBooks();
    showSection('books');
}

// Put（改）: 修改书号相关的书籍为“借阅”状态
async function borrowBook(id) {
    await fetch(`/books/${id}/borrow`, { method: 'PUT' });
    fetchBooks();
}

// Put（改）: 修改书号相关的书籍为“归还”状态
async function returnBook(id) {
    await fetch(`/books/${id}/return`, { method: 'PUT' });
    fetchBooks();
}

// Delete（删）: 删除书号相关的书籍
async function deleteBook(id) {
    await fetch(`/books/${id}`, { method: 'DELETE' });
    fetchBooks();
}

// 用于控制显示哪个部分的函数
function showSection(section) {
    let booksButton = document.getElementById('books-button');
    let addButton = document.getElementById('add-button');
    let booksSection = document.getElementById('books-section');
    let addSection = document.getElementById('add-section');

    if (section === 'books') {
        booksButton.className = 'selected';
        addButton.className = '';
        booksSection.style.display = 'block';
        addSection.style.display = 'none';
    } else if (section === 'add') {
        booksButton.className = '';
        addButton.className = 'selected';
        booksSection.style.display = 'none';
        addSection.style.display = 'block';
    }
}

// 更新上传的封面图
function updatePreview(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('cover-preview');
            preview.style.backgroundImage = `url('${e.target.result}')`;
        };
        reader.readAsDataURL(file);
    }
}

fetchBooks();
