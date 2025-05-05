const pool = require('../db');
const { getOrderPickList } = require('../services/orderService');

exports.pickItem = async (req, res) => {
    const { sku, zone, x, y, z, quantity, order_id } = req.body;

    try {
        // Отримуємо список дозволених для відбору товарів
        const pickList = await getOrderPickList(order_id);

        // Перевіряємо, чи є така комбінація у списку
        const isAllowed = pickList.some(
            (item) =>
                item.sku === sku &&
                item.quantity === quantity &&
                item.location.zone === zone &&
                item.location.x === x &&
                item.location.y === y &&
                item.location.z === z
        );

        if (!isAllowed) {
            return res
                .status(400)
                .json({ error: 'Неправильна комбінація для відбору' });
        }

        // Знаходимо storage_location_id за координатами
        const locationRes = await pool.query(
            `SELECT id FROM storage_locations
         WHERE zone = $1 AND x = $2 AND y = $3 AND z = $4`,
            [zone, x, y, z]
        );

        if (locationRes.rowCount === 0) {
            return res.status(404).json({ error: 'Комірка не знайдена' });
        }

        const storage_location_id = locationRes.rows[0].id;

        // Знаходимо product_id за SKU
        const productRes = await pool.query(
            `SELECT id FROM products WHERE sku = $1`,
            [sku]
        );

        if (productRes.rowCount === 0) {
            return res.status(404).json({ error: 'Продукт не знайдено' });
        }

        const product_id = productRes.rows[0].id;

        // Перевірка наявності у placed_items
        const placedRes = await pool.query(
            `SELECT id, quantity FROM placed_items
         WHERE product_id = $1 AND storage_location_id = $2`,
            [product_id, storage_location_id]
        );

        if (placedRes.rowCount === 0 || placedRes.rows[0].quantity < quantity) {
            return res
                .status(400)
                .json({ error: 'Недостатньо товару в комірці' });
        }

        const placedItemId = placedRes.rows[0].id;
        const newQuantity = placedRes.rows[0].quantity - quantity;

        // Зменшуємо кількість або видаляємо рядок
        if (newQuantity > 0) {
            await pool.query(
                `UPDATE placed_items SET quantity = $1 WHERE id = $2`,
                [newQuantity, placedItemId]
            );
        } else {
            await pool.query(`DELETE FROM placed_items WHERE id = $1`, [
                placedItemId,
            ]);
        }

        // Додаємо запис у shipment_process
        await pool.query(
            `INSERT INTO shipment_process (order_id, product_id, storage_location_id, quantity, status)
         VALUES ($1, $2, $3, $4, 'picked')`,
            [order_id, product_id, storage_location_id, quantity]
        );

        res.json({ message: 'Товар успішно відібрано' });
    } catch (err) {
        console.error('Error in pickItem:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPickedShipments = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'picked'
             ORDER BY sp.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching picked shipments:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPickedShipmentsByOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'picked' AND sp.order_id = $1
             ORDER BY sp.created_at DESC`,
            [orderId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching picked shipments by order:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
