const express = require('express');
const { getBoards, createNewBoard } = require('../controllers/board');
const { authenticate, authorize } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();

const checkAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    jwt.verify(token, "secret", (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Пользователь неавторизован' });

        req.userId = decoded.userId;
        next();
    });
};

router.get('/', checkAuth, getBoards);
router.post('/', checkAuth, createNewBoard);

module.exports = router;