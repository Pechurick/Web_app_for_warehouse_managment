const pool = require('../db'); // Підключення до бази даних

// Додавання нового товару в received_items
exports.addReceivedItemBySku = async (req, res) => {
    const { sku, quantity } = req.body;

    if (typeof quantity !== 'number') {
        return res.status(400).json({ message: 'Кількість має бути числом' });
    }

    if (!sku || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Невірні вхідні дані' });
    }

    try {
        // Знаходимо продукт по sku
        const productResult = await pool.query(
            'SELECT id FROM products WHERE sku = $1',
            [sku]
        );

        if (productResult.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Товар з таким SKU не знайдено' });
        }

        const product_id = productResult.rows[0].id;

        // Перевіряємо, чи товар уже є в received_items
        const existing = await pool.query(
            'SELECT id, quantity FROM received_items WHERE product_id = $1',
            [product_id]
        );

        if (existing.rowCount > 0) {
            const newQuantity = existing.rows[0].quantity + quantity;
            const update = await pool.query(
                'UPDATE received_items SET quantity = $1 WHERE product_id = $2 RETURNING *',
                [newQuantity, product_id]
            );
            return res
                .status(200)
                .json({ message: 'Кількість оновлено', data: update.rows[0] });
        } else {
            const insert = await pool.query(
                'INSERT INTO received_items (product_id, quantity) VALUES ($1, $2) RETURNING *',
                [product_id, quantity]
            );
            return res.status(201).json({
                message: 'Товар додано в received_items',
                data: insert.rows[0],
            });
        }
    } catch (err) {
        console.error('Помилка при додаванні товару за SKU:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getAllReceivedItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                r.id, 
                r.quantity, 
                p.name AS product_name, 
                p.sku,
                p.image_url
            FROM received_items r
            JOIN products p ON r.product_id = p.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Помилка при отриманні товарів:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getReceivedItemBySku = async (req, res) => {
    const { sku } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT 
                r.id, 
                r.quantity, 
                p.name AS product_name, 
                p.sku,
                p.image_url 
            FROM received_items r
            JOIN products p ON r.product_id = p.id
            WHERE p.sku = $1
        `,
            [sku]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Товар не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Помилка при отриманні товару по SKU:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.deleteReceivedItemBySku = async (req, res) => {
    const { sku } = req.params;

    try {
        // Знаходимо product_id по sku
        const productResult = await pool.query(
            'SELECT id FROM products WHERE sku = $1',
            [sku]
        );

        if (productResult.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Товар з таким SKU не знайдено' });
        }

        const productId = productResult.rows[0].id;

        // Видаляємо з received_items
        const deleteResult = await pool.query(
            'DELETE FROM received_items WHERE product_id = $1 RETURNING *',
            [productId]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({
                message: 'У таблиці received_items такий товар відсутній',
            });
        }

        res.json({
            message: 'Товар успішно видалено',
            deleted: deleteResult.rows,
        });
    } catch (err) {
        console.error('Помилка при видаленні товару по SKU:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.updateReceivedItemBySku = async (req, res) => {
    const { sku } = req.params;
    const fields = ['quantity']; // Додавай інші поля, якщо в таблиці зʼявляться
    const updates = [];
    const values = [];

    try {
        // Знайдемо product_id по sku
        const productResult = await pool.query(
            'SELECT id FROM products WHERE sku = $1',
            [sku]
        );

        if (productResult.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Товар з таким SKU не знайдено' });
        }

        const productId = productResult.rows[0].id;

        // Валідація типів
        if ('quantity' in req.body) {
            const quantity = Number(req.body.quantity);
            if (
                isNaN(quantity) ||
                quantity < 0 ||
                !Number.isInteger(quantity)
            ) {
                return res.status(400).json({
                    message:
                        'Невірне значення для quantity (має бути цілим числом ≥ 0)',
                });
            }
        }

        // Підготовка до оновлення
        fields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates.push(`${field} = $${updates.length + 1}`);
                values.push(req.body[field]);
            }
        });

        if (updates.length === 0) {
            return res
                .status(400)
                .json({ message: 'Немає даних для оновлення' });
        }

        values.push(productId); // WHERE product_id = $n

        const query = `
            UPDATE received_items
            SET ${updates.join(', ')}
            WHERE product_id = $${values.length}
            RETURNING *
        `;

        const updateResult = await pool.query(query, values);

        if (updateResult.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Товар у received_items не знайдено' });
        }

        res.json({ message: 'Товар оновлено', item: updateResult.rows[0] });
    } catch (err) {
        console.error('Помилка при оновленні по SKU:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
