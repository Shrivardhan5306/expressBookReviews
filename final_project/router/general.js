const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

/**
 * Helper function to verify if a username already exists in the system
 * @param {string} username - Username to verify
 * @returns {boolean} - True if username is already registered, false otherwise
 */
const doesExist = (username) => {
    const existing = users.filter((user) => user.username === username);
    return existing.length > 0;
};

// =========================================================================
// Task 6: Register a new user
// =========================================================================
/**
 * Route handler to register a new customer in the book review system.
 * Validates request parameters and ensures unique usernames.
 */
public_users.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!doesExist(username)) {
            users.push({ username, password });
            return res.status(200).json({ message: 'Customer successfully registered. Now you can login' });
        } else {
            return res.status(404).json({ message: 'User already exists!' });
        }
    }
    return res.status(404).json({ message: 'Unable to register user: missing username or password.' });
});

// =========================================================================
// Tasks 10-13: Async/Await & Promise implementations with optimized filtering
// =========================================================================

/**
 * Task 10: Asynchronously retrieves all available books using a Promise callback.
 * @returns {Promise<Object>} Resolves with the complete books catalog dictionary.
 */
const getAllBooksPromise = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject(new Error('Unable to retrieve books catalog'));
        }
    });
};

/**
 * Task 11: Asynchronously retrieves book details by ISBN using a Promise callback.
 * Direct O(1) dictionary key lookup for optimal performance.
 * @param {string} isbn - Book ISBN identifier
 * @returns {Promise<Object>} Resolves with book object matching specified ISBN.
 */
const getBookByISBNPromise = (isbn) => {
    return new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject(new Error('Book with ISBN ' + isbn + ' not found'));
        }
    });
};

/**
 * Task 12: Asynchronously retrieves books by author name using a Promise callback.
 * Optimized linear O(N) array filtering utilizing Object.values for high performance.
 * @param {string} author - Name of the author to search
 * @returns {Promise<Array>} Resolves with array of book objects matching specified author.
 */
const getBooksByAuthorPromise = (author) => {
    return new Promise((resolve, reject) => {
        if (!author) {
            return reject(new Error('Author parameter is required'));
        }
        const targetAuthor = author.trim().toLowerCase();
        const matchingBooks = Object.values(books).filter(
            (book) => book.author && book.author.toLowerCase() === targetAuthor
        );
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error('No books found for author: ' + author));
        }
    });
};

/**
 * Task 13: Asynchronously retrieves books by title using a Promise callback.
 * Optimized linear O(N) array filtering utilizing Object.values for high performance.
 * @param {string} title - Title of the book to search
 * @returns {Promise<Array>} Resolves with array of book objects matching specified title.
 */
const getBooksByTitlePromise = (title) => {
    return new Promise((resolve, reject) => {
        if (!title) {
            return reject(new Error('Title parameter is required'));
        }
        const targetTitle = title.trim().toLowerCase();
        const matchingBooks = Object.values(books).filter(
            (book) => book.title && book.title.toLowerCase() === targetTitle
        );
        if (matchingBooks.length > 0) {
            resolve(matchingBooks);
        } else {
            reject(new Error('No books found with title: ' + title));
        }
    });
};

// =========================================================================
// Axios Async/Await HTTP client functions demonstrating remote API consumption
// =========================================================================

/**
 * Task 10 (Axios): Asynchronously fetches complete book list using Axios with async/await
 * @param {string} baseURL - API root URL (defaults to http://localhost:5000)
 * @returns {Promise<Object>} Book list data returned from API
 */
const fetchAllBooksAxios = async (baseURL = 'http://localhost:5000') => {
    const response = await axios.get(baseURL + '/');
    return response.data;
};

/**
 * Task 11 (Axios): Asynchronously fetches book by ISBN using Axios with async/await
 * @param {string} isbn - Book ISBN identifier
 * @param {string} baseURL - API root URL
 * @returns {Promise<Object>} Book details data returned from API
 */
const fetchBookByISBNAxios = async (isbn, baseURL = 'http://localhost:5000') => {
    const response = await axios.get(baseURL + '/isbn/' + isbn);
    return response.data;
};

/**
 * Task 12 (Axios): Asynchronously fetches books by Author using Axios with async/await
 * @param {string} author - Author name
 * @param {string} baseURL - API root URL
 * @returns {Promise<Array>} Matching books data returned from API
 */
const fetchBooksByAuthorAxios = async (author, baseURL = 'http://localhost:5000') => {
    const response = await axios.get(baseURL + '/author/' + encodeURIComponent(author));
    return response.data;
};

/**
 * Task 13 (Axios): Asynchronously fetches books by Title using Axios with async/await
 * @param {string} title - Book title
 * @param {string} baseURL - API root URL
 * @returns {Promise<Array>} Matching books data returned from API
 */
const fetchBooksByTitleAxios = async (title, baseURL = 'http://localhost:5000') => {
    const response = await axios.get(baseURL + '/title/' + encodeURIComponent(title));
    return response.data;
};

// =========================================================================
// Express Route Endpoints (Tasks 1 - 5 and Tasks 10 - 13)
// =========================================================================

/**
 * Task 1 & Task 10: Get the list of all books available in the shop
 * Uses async/await with Promise-based retrieval and formats JSON with 4-space indentation.
 */
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getAllBooksPromise();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * Task 2 & Task 11: Get book details based on ISBN
 * Uses async/await with Promise-based lookup.
 */
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBNPromise(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

/**
 * Task 3 & Task 12: Get book details based on Author
 * Uses async/await with optimized filtering logic.
 */
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const matchingBooks = await getBooksByAuthorPromise(author);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

/**
 * Task 4 & Task 13: Get book details based on Title
 * Uses async/await with optimized filtering logic.
 */
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const matchingBooks = await getBooksByTitlePromise(title);
        return res.status(200).json(matchingBooks);
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
});

/**
 * Task 5: Get book review for specified ISBN
 * Public endpoint returning the reviews dictionary for the specified book.
 */
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: 'Book with ISBN ' + isbn + ' not found' });
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
