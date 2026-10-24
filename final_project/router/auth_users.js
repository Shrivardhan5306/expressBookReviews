const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

/**
 * Checks if a given username is non-empty and formatted properly
 * @param {string} username
 * @returns {boolean}
 */
const isValid = (username) => {
    return Boolean(username && username.trim().length > 0);
};

/**
 * Checks if username and password match any registered user in memory
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const authenticatedUser = (username, password) => {
    const matchingUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return matchingUsers.length > 0;
};

/**
 * Handler for user login (Task 7)
 * Authenticates user, signs JWT token, stores credentials in session, and returns reference message
 */
const handleLogin = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: 'Error logging in: missing username or password' });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };
        // Return standard reference confirmation message
        return res.status(200).send('User successfully logged in');
    } else {
        return res.status(208).json({ message: 'Invalid Login. Check username and password' });
    }
};

regd_users.post('/login', handleLogin);

/**
 * Handler for adding or modifying a book review (Task 8)
 * Updates book review under current username and returns sample message-and-reviews structure
 */
const handlePutReview = (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review || req.body.review;
    const username = (req.session && req.session.authorization)
        ? req.session.authorization.username
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(401).json({ message: 'User session not found. Please log in first.' });
    }

    if (!review) {
        return res.status(400).json({ message: 'Review content is required in query parameter' });
    }

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        // Return structured JSON response containing success message and updated reviews dictionary
        return res.status(200).json({
            message: 'The review for the book with ISBN ' + isbn + ' has been added/updated.',
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: 'Book with ISBN ' + isbn + ' not found' });
    }
};

regd_users.put('/auth/review/:isbn', handlePutReview);
regd_users.put('/review/:isbn', handlePutReview);

/**
 * Handler for deleting a user's own book review (Task 9)
 * Deletes review submitted by authenticated user and returns reference confirmation message
 */
const handleDeleteReview = (req, res) => {
    const isbn = req.params.isbn;
    const username = (req.session && req.session.authorization)
        ? req.session.authorization.username
        : (req.user ? req.user.username : null);

    if (!username) {
        return res.status(401).json({ message: 'User session not found. Please log in first.' });
    }

    if (books[isbn]) {
        if (books[isbn].reviews && books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            // Return deletion message consistent with course rubric
            return res.status(200).send('Review for ISBN ' + isbn + ' deleted.');
        } else {
            return res.status(404).json({ message: 'No review found for user ' + username + ' on book with ISBN ' + isbn });
        }
    } else {
        return res.status(404).json({ message: 'Book with ISBN ' + isbn + ' not found' });
    }
};

regd_users.delete('/auth/review/:isbn', handleDeleteReview);
regd_users.delete('/review/:isbn', handleDeleteReview);

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
