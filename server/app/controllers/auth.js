const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.register = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user) {
            return res.status(400).json({ error: 'Пользователь уже существует '});
        }

        const newUser = new User({ username, password, role: "user" });
        await newUser.save();

        const JWTtoken = jwt.sign(
            { userId: newUser._id, role: newUser.role },
            process.env.SECRET_KEY,
            { expiresIn: '10h' }
        );

        res.cookie('jwt', JWTtoken, {
            maxAge: 36000000
        });

        res.status(201).json({
            userId: newUser._id,
            role: newUser.role
        });
    } catch(err) {
        res.status(500).json({ error: 'Ошибка сервера' });
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден'});
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Неверный пароль'});
        }

        const JWTtoken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: '1h'}
        );

        res.cookie('jwt', JWTtoken, {
            maxAge: 3600000
        });

        res.json({ message: 'Авторизация успешна', role: user.role});
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
        next(err);
    }
}