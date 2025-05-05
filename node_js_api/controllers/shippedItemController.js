const pool = require('../db');

exports.shipPickedItem = async (req, res) => {
    const { orderId } = req.params;
    const { sku, quantity } = req.body;

    try {
        // Знайти відповідний запис у shipment_process тільки серед "checked"
        const { rows: matchingRows } = await pool.query(
            `SELECT sp.id
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             WHERE sp.order_id = $1
               AND p.sku = $2
               AND sp.quantity = $3
               AND sp.status = 'checked'
             LIMIT 1`,
            [orderId, sku, quantity]
        );

        if (matchingRows.length === 0) {
            return res.status(400).json({
                error: 'No matching checked item found for checking.',
            });
        }

        const shipmentProcessId = matchingRows[0].id;

        // Оновити статус на "shipped" тільки якщо поточний статус "checked"
        const updateResult = await pool.query(
            `UPDATE shipment_process
             SET status = 'shipped'
             WHERE id = $1 AND status = 'checked'`,
            [shipmentProcessId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(400).json({
                error: 'Failed to update status. Item may have been already shipped.',
            });
        }

        res.json({ message: 'Item successfully shipped.' });
    } catch (err) {
        console.error('Error shipped picked item:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getShippedShipments = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, p.image_url, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'shipped'
             ORDER BY sp.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching shipped shipments:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getShippedShipmentsByOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, p.image_url, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'shipped' AND sp.order_id = $1
             ORDER BY sp.created_at DESC`,
            [orderId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching shipped shipments by order:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
