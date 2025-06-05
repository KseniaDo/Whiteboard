const mongoose = require('mongoose');
const Board = require('../models/Board');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.getBoards = async (req, res, next) => {
    try {
        const Boards = await Board.find({ author: mongoose.Types.ObjectId.createFromHexString(req.userId) }).sort({ createdAt: -1 });

        res.json(Boards);
    } catch(err) {
        res.status(500).json({ error: 'Ошибка сервера' });
        next(err);
    }
}

exports.createNewBoard = async (req, res, next) => {
    const { title } = req.body;

    try {
        const newBoard = new Board({ title, author: req.userId });
        await newBoard.save();

        res.status(201).json(newBoard);
    } catch(err) {
        res.status(500).json({ error: 'Ошибка сервера' });
        next(err);
    }
}
