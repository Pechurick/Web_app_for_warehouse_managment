const jwt = require('jsonwebtoken');
//require('dotenv').config();

// Мідлвер для перевірки токену
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', ''); // отримуємо токен з заголовка

    if (!token) {
        return res.status(401).json({ message: 'Токен не знайдено' });
    }

    try {
        //console.log('Token:', token); // Лог токена для дебагу
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // перевіряємо токен
        req.user = decoded; // додаємо дані користувача до запиту
        next();
    } catch (err) {
        res.status(403).json({ message: 'Токен недійсний' });
    }
};

module.exports = { authenticateToken };
