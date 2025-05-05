const pool = require('../db'); // Імпортуємо підключення до бази даних

const bcrypt = require('bcrypt');

exports.createClient = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
        return res
            .status(400)
            .json({ message: 'Поля name, email та password обов’язкові' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO clients (name, email, phone, password)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, phone, created_at`,
            [name, email, phone || null, hashedPassword]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Помилка при створенні клієнта:', err);
        if (err.code === '23505') {
            res.status(400).json({ message: 'Email вже використовується' });
        } else {
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }
};

exports.getAllClients = async (req, res) => {
    try {
        const query = 'SELECT id, name, email, phone FROM clients'; // Вибираємо тільки необхідні поля
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getClientById = async (req, res) => {
    const { id } = req.params;

    try {
        const query =
            'SELECT id, name, email, phone FROM clients WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Клієнта не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.deleteClient = async (req, res) => {
    const { id } = req.params;

    try {
        // Спочатку перевіримо, чи існує клієнт
        const checkQuery = 'SELECT id FROM clients WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [id]);

        if (checkResult.rowCount === 0) {
            return res.status(404).json({ message: 'Клієнта не знайдено' });
        }

        // Якщо клієнт знайдений, видалимо його
        const deleteQuery = 'DELETE FROM clients WHERE id = $1';
        await pool.query(deleteQuery, [id]);

        res.status(200).json({ message: 'Клієнта успішно видалено' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

// controllers/clientController.js
exports.updateClient = async (req, res) => {
    const { id } = req.params;
    const { name, email, password, phone } = req.body;

    try {
        // Перевірка, чи існує клієнт
        const client = await pool.query('SELECT * FROM clients WHERE id = $1', [
            id,
        ]);
        if (client.rowCount === 0) {
            return res.status(404).json({ message: 'Клієнта не знайдено' });
        }

        // Поточні значення
        const currentClient = client.rows[0];

        // Оновлені значення або залишаємо старі
        const newName = name || currentClient.name;
        const newEmail = email || currentClient.email;
        const newPhone = phone || currentClient.phone;

        // Якщо надійшов новий пароль — хешуємо його
        let newPassword = currentClient.password;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            newPassword = hashedPassword;
        }

        const updateQuery = `
            UPDATE clients
            SET name = $1, email = $2, password = $3, phone = $4
            WHERE id = $5
        `;
        await pool.query(updateQuery, [
            newName,
            newEmail,
            newPassword,
            newPhone,
            id,
        ]);

        res.status(200).json({ message: 'Клієнта оновлено' });
    } catch (err) {
        console.error('Помилка при оновленні клієнта:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
