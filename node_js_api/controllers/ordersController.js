const pool = require('../db');

exports.createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const { client_id, items } = req.body;
        if (!client_id || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Невірні дані запиту' });
        }

        // Перевірка наявності товарів
        for (const item of items) {
            const { sku, quantity } = item;
            if (!sku || typeof quantity !== 'number') {
                return res
                    .status(400)
                    .json({ error: 'Кожен товар повинен мати sku і quantity' });
            }

            const result = await client.query(
                `
        SELECT SUM(quantity) as total_quantity
        FROM placed_items pi
        JOIN products p ON pi.product_id = p.id
        WHERE p.sku = $1
        `,
                [sku]
            );

            const total = parseInt(result.rows[0].total_quantity) || 0;
            if (total < quantity) {
                return res
                    .status(400)
                    .json({ error: `Недостатньо товару з SKU ${sku}` });
            }
        }

        await client.query('BEGIN');

        // Створюємо замовлення
        const orderResult = await client.query(
            `INSERT INTO orders (client_id, order_date) VALUES ($1, NOW()) RETURNING id`,
            [client_id]
        );
        const order_id = orderResult.rows[0].id;

        // Додаємо товари до order_items
        for (const item of items) {
            const { sku, quantity } = item;

            // Отримуємо product_id по sku
            const productResult = await client.query(
                `SELECT id FROM products WHERE sku = $1`,
                [sku]
            );
            const product_id = productResult.rows[0]?.id;

            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
                [order_id, product_id, quantity]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({ message: 'Замовлення створено', order_id });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера' });
    } finally {
        client.release();
    }
};

exports.getOrderPickList = async (req, res) => {
    const orderId = req.params.id;

    try {
        // Отримати товари з замовлення разом із SKU
        const { rows: orderItems } = await pool.query(
            `SELECT oi.product_id, oi.quantity, p.sku
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        const result = [];

        for (const item of orderItems) {
            const { product_id, quantity, sku } = item;

            // Загальна кількість товару на складі
            const { rows: totalRows } = await pool.query(
                `SELECT COALESCE(SUM(quantity), 0) AS total
                 FROM placed_items
                 WHERE product_id = $1`,
                [product_id]
            );

            const totalAvailable = parseInt(totalRows[0].total, 10);

            // Якщо на складі не вистачає товару — повертаємо помилку
            if (totalAvailable < quantity) {
                return res.status(400).json({
                    error: `Недостатньо товару зі SKU ${sku}: потрібно ${quantity}, на складі лише ${totalAvailable}`,
                });
            }

            // Знайти місця з цим товаром
            const placedRes = await pool.query(
                `SELECT pi.id, pi.quantity, sl.zone, sl.x, sl.y, sl.z
                 FROM placed_items pi
                 JOIN storage_locations sl ON pi.storage_location_id = sl.id
                 WHERE pi.product_id = $1 AND pi.quantity > 0
                 ORDER BY pi.quantity DESC`,
                [product_id]
            );

            let remaining = quantity;
            const locations = [];

            for (const place of placedRes.rows) {
                if (remaining <= 0) break;

                const take = Math.min(place.quantity, remaining);
                locations.push({
                    sku,
                    quantity: take,
                    location: {
                        zone: place.zone,
                        x: place.x,
                        y: place.y,
                        z: place.z,
                    },
                });

                remaining -= take;
            }

            result.push(...locations);
        }

        res.json(result);
    } catch (err) {
        console.error('Error building pick list:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getClientOrders = async (req, res) => {
    const { clientId } = req.params;

    try {
        const result = await pool.query(
            `
        SELECT 
          o.id AS order_id,
          o.order_date,
          oi.quantity,
          p.name AS product_name,
          p.sku
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.client_id = $1
        ORDER BY o.order_date DESC
      `,
            [clientId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching client orders:', error);
        res.status(500).json({ error: 'Failed to fetch client orders' });
    }
};

exports.deleteOrder = async (req, res) => {
    const { orderId } = req.params;
    const { client_id } = req.body;

    try {
        const check = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND client_id = $2',
            [orderId, client_id]
        );

        if (check.rows.length === 0) {
            return res
                .status(403)
                .json({ error: 'Access denied: not your order' });
        }

        await pool.query('BEGIN');
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [
            orderId,
        ]);
        await pool.query('DELETE FROM orders WHERE id = $1', [orderId]);
        await pool.query('COMMIT');

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Failed to delete order' });
    }
};

exports.getOrderByIdForClient = async (req, res) => {
    const { orderId } = req.params;
    const { client_id } = req.query;

    try {
        const orderRes = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND client_id = $2',
            [orderId, client_id]
        );

        if (orderRes.rows.length === 0) {
            return res.status(404).json({
                error: 'Order not found or does not belong to this client',
            });
        }

        const itemsRes = await pool.query(
            `
        SELECT p.sku, p.name, oi.quantity
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
        `,
            [orderId]
        );

        const order = {
            id: orderRes.rows[0].id,
            client_id: orderRes.rows[0].client_id,
            created_at: orderRes.rows[0].created_at,
            items: itemsRes.rows,
        };

        res.json(order);
    } catch (error) {
        console.error('Error fetching order by client_id and order_id:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const { client_id } = req.body; // Для перевірки права доступу клієнта
    const { items } = req.body; // Нові товари для замовлення

    try {
        // Перевіряємо, чи існує замовлення для цього клієнта
        const orderRes = await pool.query(
            'SELECT * FROM orders WHERE id = $1 AND client_id = $2',
            [orderId, client_id]
        );

        if (orderRes.rows.length === 0) {
            return res.status(404).json({
                error: 'Order not found or does not belong to this client',
            });
        }

        // Перевіряємо, чи вистачає товарів на складі для кожного з замовлених товарів
        for (let item of items) {
            const { sku, quantity } = item;

            // Отримуємо product_id з sku
            const productRes = await pool.query(
                'SELECT id FROM products WHERE sku = $1',
                [sku]
            );
            if (productRes.rows.length === 0) {
                return res
                    .status(404)
                    .json({ error: `Product with sku ${sku} not found` });
            }
            const productId = productRes.rows[0].id;

            // Перевіряємо кількість товару на складі в placed_items
            const placedItemsRes = await pool.query(
                `
          SELECT SUM(quantity) AS total_quantity
          FROM placed_items
          WHERE product_id = $1
          `,
                [productId]
            );

            const availableQuantity =
                placedItemsRes.rows[0].total_quantity || 0;

            // Якщо замовлена кількість більша за наявну, повертаємо помилку
            if (availableQuantity < quantity) {
                return res.status(400).json({
                    error: `Not enough stock for product with sku ${sku}. Available: ${availableQuantity}, Requested: ${quantity}`,
                });
            }
        }

        // Якщо перевірка пройшла успішно, оновлюємо замовлення
        // Спочатку видаляємо старі записи в order_items для цього замовлення
        await pool.query('DELETE FROM order_items WHERE order_id = $1', [
            orderId,
        ]);

        // Додаємо нові записи в order_items
        for (let item of items) {
            const { sku, quantity } = item;

            const productRes = await pool.query(
                'SELECT id FROM products WHERE sku = $1',
                [sku]
            );
            const productId = productRes.rows[0].id;

            await pool.query(
                'INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)',
                [orderId, productId, quantity]
            );
        }

        res.status(200).json({ message: 'Order updated successfully' });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllOrdersWithClients = async (req, res) => {
    try {
        const { rows } = await pool.query(`
        SELECT 
          o.id AS order_id,
          o.client_id,
          o.order_date,
          o.status,
          c.name AS client_name,
          c.email,
          c.phone
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        ORDER BY o.order_date DESC
      `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching orders with clients:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getOrderWithClientById = async (req, res) => {
    const orderId = req.params.id;

    try {
        const { rows } = await pool.query(
            `
        SELECT 
          o.id AS order_id,
          o.client_id,
          o.order_date,
          o.status,
          c.name AS client_name,
          c.email,
          c.phone
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        WHERE o.id = $1
      `,
            [orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching order by ID:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = [
        'pending',
        'picked',
        'checked',
        'shipped',
        'canceled',
    ]; // дозволені статуси

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const { rows } = await pool.query(
            `UPDATE orders
         SET status = $1
         WHERE id = $2
         RETURNING *`,
            [status, orderId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            message: `Order status updated to '${status}'`,
            order: rows[0],
        });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getOrdersByStatus = async (req, res) => {
    const status = req.params.status;

    const allowedStatuses = [
        'pending',
        'picked',
        'checked',
        'shipped',
        'canceled',
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT o.id, o.client_id, o.order_date, o.status,
                c.name, c.email, c.phone
         FROM orders o
         JOIN clients c ON o.client_id = c.id
         WHERE o.status = $1
         ORDER BY o.order_date DESC`,
            [status]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching orders by status:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getOrderByIdAndStatus = async (req, res) => {
    const { id, status } = req.params;

    const allowedStatuses = [
        'pending',
        'picked',
        'checked',
        'shipped',
        'canceled',
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const { rows } = await pool.query(
            `SELECT o.id, o.client_id, o.order_date, o.status,
                c.name, c.email, c.phone
         FROM orders o
         JOIN clients c ON o.client_id = c.id
         WHERE o.id = $1 AND o.status = $2`,
            [id, status]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ error: 'Order not found with given status' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching order by id and status:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
