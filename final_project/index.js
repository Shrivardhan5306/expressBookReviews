const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware configured for customer authentication
app.use(session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware to verify JWT token stored in session or header
const authMiddleware = function (req, res, next) {
    // Only authenticate mutating operations on review endpoints; GET is public
    if (req.method === 'GET') {
        return next();
    }

    let token = null;
    if (req.session && req.session.authorization) {
        token = req.session.authorization['accessToken'];
    } else if (req.headers['authorization']) {
        token = req.headers['authorization'].replace(/^Bearer\s+/i, '');
    }

    if (token) {
        jwt.verify(token, 'access', (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: 'User not authenticated' });
            }
        });
    } else {
        return res.status(403).json({ message: 'User not logged in' });
    }
};

// Protect endpoints that modify reviews
app.use('/customer/auth/*', authMiddleware);
app.use('/review/:isbn', authMiddleware);

const PORT = 5000;

// Mount customer routes on both /customer and root / so both /customer/login and /login work
app.use('/customer', customer_routes);
app.use('/', customer_routes);
app.use('/', genl_routes);

app.listen(PORT, () => console.log('Server is running on port ' + PORT));
