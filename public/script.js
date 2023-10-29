// Get（查）: 获取所有的书本，并显示成列表形式，右侧有操作按钮
async function fetchBooks() {
    const response = await fetch('/books');
    const books = await response.json();
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    for (let book of books) {
        const listItem = document.createElement('li');
        listItem.textContent = `${book.title} (Borrowed: ${book.borrowed})`;
        listItem.innerHTML += `<img src="/uploads/${book.cover}" alt="${book.title} cover" width="50">`;
        listItem.innerHTML += `<button onclick="borrowBook(${book.id})">Borrow</button>`;
        listItem.innerHTML += `<button onclick="returnBook(${book.id})">Return</button>`;
        listItem.innerHTML += `<button onclick="deleteBook(${book.id})">Delete</button>`;
        bookList.appendChild(listItem);
    }
}

// Post（增）: 增加新书，提交信息到后台并保存
async function addBook() {
    const title = document.getElementById('new-book-title').value;
    const cover = document.getElementById('book-cover').files[0];

    const formData = new FormData();
    formData.append('title', title);
    formData.append('bookCover', cover);

    await fetch('/books', {
        method: 'POST',
        body: formData
    });
    fetchBooks();
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

fetchBooks();
