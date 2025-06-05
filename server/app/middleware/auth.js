const JWT = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const JWTtoken = req.cookies.jwt;

    if (!JWTtoken) return res.status(401).json({ error: 'Доступ запрещен '});

    JWT.verify(JWTtoken, "secret", (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Недействительный токен' });
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    });
};

exports.authorize = (role) => (req, res, next) => {
    if (req.userRole !== role) {
        return res.status(403).json({ error: 'Доступ запрещен' });
    }
    next();
}