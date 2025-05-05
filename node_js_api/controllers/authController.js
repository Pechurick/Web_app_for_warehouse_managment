const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
//require('dotenv').config();

// Генерація JWT токену
const generateToken = (userId, role, email, name) => {
    return jwt.sign(
        { userId, role, email, name },
        process.env.JWT_SECRET_KEY, // Ваша секретна фраза для підпису токену
        { expiresIn: '24h' } // Термін дії токену
    );
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'Email і пароль обов’язкові' });
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Користувач не знайдений' });
        }

        // Перевірка пароля
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Невірний пароль' });
        }

        // Генерація токену
        const token = generateToken(user.id, user.role, user.email, user.name); // Генеруємо токен з id користувача та його роллю
        // Повертаємо токен
        res.json({ token });
        // res.json('test');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getProtectedData = (req, res) => {
    res.json({ message: 'Це захищена інформація', user: req.user });
};
