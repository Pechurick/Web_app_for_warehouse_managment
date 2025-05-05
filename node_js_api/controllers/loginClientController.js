const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // якщо є підключення до бази

exports.loginClient = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email і пароль обов’язкові' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM clients WHERE email = $1',
            [email]
        );
        const client = result.rows[0];

        if (!client) {
            return res
                .status(401)
                .json({ message: 'Невірний email або пароль' });
        }

        const passwordMatch = await bcrypt.compare(password, client.password);
        if (!passwordMatch) {
            return res
                .status(401)
                .json({ message: 'Невірний email або пароль' });
        }

        const token = jwt.sign(
            { clientId: client.id, email: client.email },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        res.json({
            token,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                phone: client.phone,
            },
        });
    } catch (err) {
        console.error('Помилка при вході клієнта:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
