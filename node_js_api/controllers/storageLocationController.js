const pool = require('../db');

// Отримати всі місця зберігання
exports.getAllStorageLocations = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM storage_locations');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching storage locations:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Отримати одне місце зберігання за id
exports.getStorageLocationById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM storage_locations WHERE id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ message: 'Storage location not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching storage location:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addStorageLocation = async (req, res) => {
    const { zone, x, y, z } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO storage_locations (zone, x, y, z) VALUES ($1, $2, $3, $4) RETURNING *',
            [zone, x, y, z]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            // Унікальне порушення
            res.status(400).json({ message: 'Ця комірка вже існує' });
        } else {
            console.error('Error adding storage location:', err);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }
};

exports.deleteStorageLocation = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM storage_locations WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Місце зберігання не знайдено' });
        }

        res.json({
            message: 'Місце зберігання видалено',
            deleted: result.rows[0],
        });
    } catch (err) {
        console.error('Помилка при видаленні:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.updateStorageLocation = async (req, res) => {
    const { id } = req.params;
    const fields = ['zone', 'x', 'y', 'z'];
    const updates = [];
    const values = [];

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
    const query = `UPDATE storage_locations SET ${updates.join(
        ', '
    )} WHERE id = $${values.length} RETURNING *`;

    try {
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Місце зберігання не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({
                message: 'Місце зберігання з такими координатами вже існує',
            });
        } else {
            console.error(err);
            res.status(500).json({ message: 'Помилка сервера' });
        }
    }
};

exports.getStorageLocationId = async (req, res) => {
    const { zone, x, y, z } = req.query;

    if (!zone || !x || !y || !z) {
        return res.status(400).json({ message: 'Всі координати обов’язкові' });
    }

    try {
        const query = `
            SELECT id FROM storage_locations
            WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4
        `;
        const values = [zone, x, y, z];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Місце зберігання не знайдено' });
        }

        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Помилка сервера при пошуку місця зберігання',
        });
    }
};
