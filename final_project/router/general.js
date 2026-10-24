const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user: missing username or password." });
});

// =========================================================================
// Tasks 10-13: Async/Await & Promise implementations
// =========================================================================
const getAllBooksPromise = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error("Unable to fetch books"));
        }
    });
};

const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject(new Error("Book not found"));
        }
    });
};

const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = [];
        for (const key in books) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("Author not found"));
        }
    });
};

const getBooksByTitlePromise = (title) => {
    return new Promise((resolve, reject) => {
        const matchingBooks = [];
        for (const key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                matchingBooks.push(books[key]);
            }
        }
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error("Title not found"));
        }
    });
};

// Axios-based async/await helpers for Tasks 10, 11, 12, 13
const fetchAllBooksAxios = async (baseURL = "http://localhost:5000") => {
    const response = await axios.get(`${baseURL}/`);
    return response.data;
};

const fetchBookByISBNAxios = async (isbn, baseURL = "http://localhost:5000") => {
    const response = await axios.get(`${baseURL}/isbn/${isbn}`);
    return response.data;
};

const fetchBooksByAuthorAxios = async (author, baseURL = "http://localhost:5000") => {
    const response = await axios.get(`${baseURL}/author/${encodeURIComponent(author)}`);
    return response.data;
};

const fetchBooksByTitleAxios = async (title, baseURL = "http://localhost:5000") => {
    const response = await axios.get(`${baseURL}/title/${encodeURIComponent(title)}`);
    return response.data;
};

// Task 1 & Task 10: Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getAllBooksPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// Task 2 & Task 11: Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBNPromise(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 3 & Task 12: Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorPromise(author);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 4 & Task 13: Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBooksByTitlePromise(title);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }
});

module.exports.general = public_users;
module.exports.getAllBooksPromise = getAllBooksPromise;
module.exports.getBookByISBNPromise = getBookByISBNPromise;
module.exports.getBooksByAuthorPromise = getBooksByAuthorPromise;
module.exports.getBooksByTitlePromise = getBooksByTitlePromise;
module.exports.fetchAllBooksAxios = fetchAllBooksAxios;
module.exports.fetchBookByISBNAxios = fetchBookByISBNAxios;
module.exports.fetchBooksByAuthorAxios = fetchBooksByAuthorAxios;
module.exports.fetchBooksByTitleAxios = fetchBooksByTitleAxios;
