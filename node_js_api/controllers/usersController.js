const pool = require('../db'); // Підключення до бази даних
const bcrypt = require('bcrypt'); // Для хешування паролів

// Отримати всіх користувачів
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Отримати одного користувача за ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Додати нового користувача
exports.createUser = async (req, res) => {
    const { name, email, password_hash, role } = req.body;

    if (!name || !email || !password_hash) {
        return res
            .status(400)
            .json({ message: 'Імʼя, email та пароль є обовʼязковими' });
    }

    try {
        // Хешуємо пароль
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password_hash, saltRounds);

        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
            [name, email, hashedPassword, role || 'worker']
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res
                .status(409)
                .json({ message: 'Користувач з таким email вже існує' });
        }
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Видалити користувача за id
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        res.json({ message: 'Користувача видалено', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// Оновити користувача за id
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const fields = ['name', 'email', 'password_hash', 'role'];
    const updates = [];
    const values = [];

    if (req.body.password_hash) {
        // Якщо пароль змінюється, хешуємо його
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(
            req.body.password_hash,
            saltRounds
        );
        req.body.password_hash = hashedPassword;
    }

    fields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = $${updates.length + 1}`);
            values.push(req.body[field]);
        }
    });

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Немає даних для оновлення' });
    }

    values.push(id); // для WHERE
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${
        values.length
    } RETURNING id, name, email, role`;

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
