const pool = require('../db');

exports.addPlacedItem = async (req, res) => {
    const { sku, zone, x, y, z, quantity } = req.body;

    // Валідація
    if (
        !sku ||
        !zone ||
        x == null ||
        y == null ||
        z == null ||
        quantity == null
    ) {
        return res.status(400).json({ message: "Всі поля обов'язкові" });
    }

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
        return res
            .status(400)
            .json({ message: 'Quantity має бути додатним числом' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Отримуємо product_id по SKU
        const productRes = await client.query(
            'SELECT id FROM products WHERE sku = $1',
            [sku]
        );
        if (productRes.rowCount === 0) {
            throw new Error('Товар з таким SKU не знайдено');
        }
        const product_id = productRes.rows[0].id;

        // Отримуємо id місця зберігання
        const locationRes = await client.query(
            'SELECT id FROM storage_locations WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4',
            [zone, x, y, z]
        );
        if (locationRes.rowCount === 0) {
            throw new Error('Місце зберігання не знайдено');
        }
        const storage_location_id = locationRes.rows[0].id;

        // Отримуємо наявну кількість товару з received_items
        const receivedRes = await client.query(
            'SELECT quantity FROM received_items WHERE product_id = $1',
            [product_id]
        );
        if (receivedRes.rowCount === 0 || receivedRes.rows[0].quantity < qty) {
            throw new Error('Недостатньо товару на складі');
        }

        const newReceivedQty = receivedRes.rows[0].quantity - qty;

        if (newReceivedQty === 0) {
            await client.query(
                'DELETE FROM received_items WHERE product_id = $1',
                [product_id]
            );
        } else {
            await client.query(
                'UPDATE received_items SET quantity = $1 WHERE product_id = $2',
                [newReceivedQty, product_id]
            );
        }

        // Перевіряємо, чи вже є такий запис у placed_items
        const placedRes = await client.query(
            'SELECT id, quantity FROM placed_items WHERE product_id = $1 AND storage_location_id = $2',
            [product_id, storage_location_id]
        );

        if (placedRes.rowCount > 0) {
            const newPlacedQty = placedRes.rows[0].quantity + qty;
            await client.query(
                'UPDATE placed_items SET quantity = $1 WHERE id = $2',
                [newPlacedQty, placedRes.rows[0].id]
            );
        } else {
            await client.query(
                'INSERT INTO placed_items (product_id, storage_location_id, quantity) VALUES ($1, $2, $3)',
                [product_id, storage_location_id, qty]
            );
        }

        await client.query('COMMIT');
        res.status(200).json({
            message: 'Товар успішно додано до placed_items',
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding placed item:', err);
        res.status(400).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.getAllPlacedItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                pi.id,
                pi.quantity,
                p.name AS product_name,
                p.sku,
                p.image_url,
                sl.zone,
                sl.x,
                sl.y,
                sl.z
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            JOIN storage_locations sl ON pi.storage_location_id = sl.id
            ORDER BY pi.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Помилка при отриманні placed_items:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getPlacedItemsById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT 
                pi.id,
                pi.quantity,
                p.name AS product_name,
                p.sku,
                p.image_url,
                sl.zone,
                sl.x,
                sl.y,
                sl.z
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            JOIN storage_locations sl ON pi.storage_location_id = sl.id
            WHERE pi.id = $1
            ORDER BY pi.id
        `,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Записів не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Помилка при пушуку id в placed_items:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getPlacedItemsBySku = async (req, res) => {
    const { sku } = req.query;

    if (!sku) {
        return res.status(400).json({ message: 'Параметр sku є обовʼязковим' });
    }

    try {
        const result = await pool.query(
            `
            SELECT 
                pi.id,
                pi.quantity,
                p.name AS product_name,
                p.sku,
                sl.zone,
                sl.x,
                sl.y,
                sl.z
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            JOIN storage_locations sl ON pi.storage_location_id = sl.id
            WHERE p.sku = $1
            ORDER BY pi.id
        `,
            [sku]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Записів не знайдено' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Помилка при фільтрації placed_items:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getPlacedItemsByLocation = async (req, res) => {
    const { zone, x, y, z } = req.query;

    if (!zone || !x || !y || !z) {
        return res
            .status(400)
            .json({ message: 'Потрібні всі параметри: zone, x, y, z' });
    }

    try {
        const result = await pool.query(
            `
            SELECT 
                pi.id,
                pi.quantity,
                p.name AS product_name,
                p.sku,
                sl.zone,
                sl.x,
                sl.y,
                sl.z
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            JOIN storage_locations sl ON pi.storage_location_id = sl.id
            WHERE sl.zone = $1 AND sl.x = $2 AND sl.y = $3 AND sl.z = $4
            ORDER BY pi.id
        `,
            [zone, x, y, z]
        );

        if (result.rowCount === 0) {
            return res
                .status(404)
                .json({ message: 'Немає товарів у цьому місці' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Помилка при фільтрації по координатах:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.removeQuantityFromPlacedItem = async (req, res) => {
    const { sku, zone, x, y, z, quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (
        !sku ||
        !zone ||
        x === undefined ||
        y === undefined ||
        z === undefined ||
        isNaN(qty) ||
        qty <= 0
    ) {
        return res.status(400).json({
            message:
                'Невірні або неповні дані. Обов’язкові: sku, zone, x, y, z, quantity > 0',
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Отримати product_id
        const productResult = await client.query(
            `SELECT id FROM products WHERE sku = $1`,
            [sku]
        );
        if (productResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res
                .status(404)
                .json({ message: 'Товар з таким SKU не знайдено' });
        }
        const product_id = productResult.rows[0].id;

        // Отримати storage_location_id
        const locationResult = await client.query(
            `
            SELECT id FROM storage_locations
            WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4
        `,
            [zone, x, y, z]
        );
        if (locationResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res
                .status(404)
                .json({ message: 'Місце зберігання не знайдено' });
        }
        const storage_location_id = locationResult.rows[0].id;

        // Знайти всі відповідні записи в placed_items
        const placedResult = await client.query(
            `
            SELECT id, quantity FROM placed_items
            WHERE product_id = $1 AND storage_location_id = $2
            ORDER BY id
        `,
            [product_id, storage_location_id]
        );

        let remainingToRemove = qty;
        for (const row of placedResult.rows) {
            if (remainingToRemove === 0) break;

            const removeQty = Math.min(remainingToRemove, row.quantity);
            const newQty = row.quantity - removeQty;

            if (newQty === 0) {
                await client.query(`DELETE FROM placed_items WHERE id = $1`, [
                    row.id,
                ]);
            } else {
                await client.query(
                    `UPDATE placed_items SET quantity = $1 WHERE id = $2`,
                    [newQty, row.id]
                );
            }

            // Додати у received_items
            const existingReceived = await client.query(
                `
                SELECT id, quantity FROM received_items WHERE product_id = $1
            `,
                [product_id]
            );

            if (existingReceived.rowCount > 0) {
                const existing = existingReceived.rows[0];
                await client.query(
                    `
                    UPDATE received_items SET quantity = $1 WHERE id = $2
                `,
                    [existing.quantity + removeQty, existing.id]
                );
            } else {
                await client.query(
                    `
                    INSERT INTO received_items (product_id, quantity) VALUES ($1, $2)
                `,
                    [product_id, removeQty]
                );
            }

            remainingToRemove -= removeQty;
        }

        if (remainingToRemove > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: `Не вдалося видалити ${qty} одиниць. На складі менше.`,
            });
        }

        await client.query('COMMIT');
        res.json({
            message: `Успішно видалено ${qty} одиниць товару ${sku} з місця [${zone}-${x}-${y}-${z}]`,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Помилка видалення з placed_items:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    } finally {
        client.release();
    }
};

exports.moveItemBetweenLocations = async (req, res) => {
    const { sku, from, to, quantity } = req.body;

    const qty = parseInt(quantity, 10);
    if (!sku || !from || !to || isNaN(qty) || qty <= 0) {
        return res.status(400).json({
            message:
                'Невірні або неповні дані. Обов’язкові: sku, from, to, quantity > 0',
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Знайти product_id за sku
        const productResult = await client.query(
            `SELECT id FROM products WHERE sku = $1`,
            [sku]
        );
        if (productResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res
                .status(404)
                .json({ message: 'Товар з таким SKU не знайдено' });
        }
        const product_id = productResult.rows[0].id;

        // Знайти id старого місця
        const fromLocResult = await client.query(
            `
            SELECT id FROM storage_locations WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4
        `,
            [from.zone, from.x, from.y, from.z]
        );
        if (fromLocResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Старе місце не знайдено' });
        }
        const from_id = fromLocResult.rows[0].id;

        // Знайти id нового місця
        const toLocResult = await client.query(
            `
            SELECT id FROM storage_locations WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4
        `,
            [to.zone, to.x, to.y, to.z]
        );
        if (toLocResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Нове місце не знайдено' });
        }
        const to_id = toLocResult.rows[0].id;

        // Перевірити кількість на старому місці
        const placedResult = await client.query(
            `
            SELECT id, quantity FROM placed_items WHERE product_id = $1 AND storage_location_id = $2
        `,
            [product_id, from_id]
        );
        if (placedResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Товар не знайдено на вказаному старому місці',
            });
        }

        let remainingToMove = qty;
        for (const row of placedResult.rows) {
            if (remainingToMove === 0) break;

            const moveQty = Math.min(remainingToMove, row.quantity);
            const newQty = row.quantity - moveQty;

            // Оновити або видалити старий запис
            if (newQty === 0) {
                await client.query(`DELETE FROM placed_items WHERE id = $1`, [
                    row.id,
                ]);
            } else {
                await client.query(
                    `UPDATE placed_items SET quantity = $1 WHERE id = $2`,
                    [newQty, row.id]
                );
            }

            // Додати до нового місця
            const toPlaced = await client.query(
                `
                SELECT id, quantity FROM placed_items
                WHERE product_id = $1 AND storage_location_id = $2
            `,
                [product_id, to_id]
            );

            if (toPlaced.rowCount > 0) {
                const existing = toPlaced.rows[0];
                await client.query(
                    `
                    UPDATE placed_items SET quantity = $1 WHERE id = $2
                `,
                    [existing.quantity + moveQty, existing.id]
                );
            } else {
                await client.query(
                    `
                    INSERT INTO placed_items (product_id, storage_location_id, quantity)
                    VALUES ($1, $2, $3)
                `,
                    [product_id, to_id, moveQty]
                );
            }

            remainingToMove -= moveQty;
        }

        if (remainingToMove > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: `Не вдалося перемістити ${qty} одиниць. Недостатньо товару на старому місці.`,
            });
        }

        await client.query('COMMIT');
        res.json({
            message: `Переміщено ${qty} одиниць товару ${sku} з місця [${from.zone}-${from.x}-${from.y}-${from.z}] до [${to.zone}-${to.x}-${to.y}-${to.z}]`,
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Помилка при переміщенні товару:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    } finally {
        client.release();
    }
};

exports.getPublicPlacedItems = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                p.name AS product_name,
                p.sku,
                p.image_url,
                p.description,
                p.barcode,
                p.category,
                SUM(pi.quantity) AS total_quantity
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            GROUP BY p.name, p.sku, p.image_url, p.description, p.barcode, p.category
            ORDER BY p.name;
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(
            'Помилка при отриманні публічних товарів з placed_items:',
            err
        );
        res.status(500).json({ message: 'Помилка сервера' });
    }
};

exports.getPublicPlacedItemBySku = async (req, res) => {
    const { sku } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT 
                p.name AS product_name,
                p.sku,
                p.image_url,
                p.description,
                p.barcode,
                p.category,
                SUM(pi.quantity) AS total_quantity
            FROM placed_items pi
            JOIN products p ON pi.product_id = p.id
            WHERE p.sku = $1
            GROUP BY p.name, p.sku, p.image_url, p.description, p.barcode, p.category;
        `,
            [sku]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Товар не знайдено' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Помилка при отриманні публічного товару по SKU:', err);
        res.status(500).json({ message: 'Помилка сервера' });
    }
};
