const pool = require('../db'); // Підключення до бази даних

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка сервера');
    }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Продукт не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, sku, description, category, barcode, image_url } =
            req.body;
        const result = await pool.query(
            `INSERT INTO products (name, sku, description, category, barcode, image_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, sku, description, category, barcode, image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка при створенні продукту');
    }
};

exports.updateProductById = async (req, res) => {
    const { id } = req.params;
    const fields = [
        'name',
        'sku',
        'description',
        'category',
        'barcode',
        'image_url',
    ];
    const updates = [];
    const values = [];

    fields.forEach((field, index) => {
        if (req.body[field] !== undefined) {
            updates.push(`${field} = $${updates.length + 1}`);
            values.push(req.body[field]);
        }
    });

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Немає даних для оновлення' });
    }

    values.push(id); // для WHERE
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = $${
        values.length
    } RETURNING *`;

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Продукт не знайдено' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.deleteProductById = async (req, res) => {
    try {
        //console.log(req.params);
        const { id } = req.params; // отримуємо id з URL

        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id] // передаємо id для видалення
        );

        if (result.rowCount === 0) {
            // Якщо продукт з таким id не знайдений
            return res.status(404).send('Продукт не знайдений');
        }

        res.status(200).send('Продукт успішно видалений'); // повідомлення про успішне видалення
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Помилка при видаленні продукту');
    }
};

exports.getProductIdBySku = async (req, res) => {
    const { sku } = req.params;

    try {
        const query = `
            SELECT id FROM products
            WHERE sku = $1
        `;
        const result = await pool.query(query, [sku]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Продукт не знайдено' });
        }

        res.json({ id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка сервера при пошуку товару' });
    }
};
