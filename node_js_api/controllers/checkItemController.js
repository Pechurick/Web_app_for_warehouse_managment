// controllers/shipmentProcessController.js
const pool = require('../db');

exports.checkPickedItem = async (req, res) => {
    const { orderId } = req.params;
    const { sku, quantity } = req.body;

    try {
        // Знайти відповідний запис у shipment_process тільки серед "picked"
        const { rows: matchingRows } = await pool.query(
            `SELECT sp.id
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             WHERE sp.order_id = $1
               AND p.sku = $2
               AND sp.quantity = $3
               AND sp.status = 'picked'
             LIMIT 1`,
            [orderId, sku, quantity]
        );

        if (matchingRows.length === 0) {
            return res
                .status(400)
                .json({ error: 'No matching picked item found for checking.' });
        }

        const shipmentProcessId = matchingRows[0].id;

        // Оновити статус на "checked" тільки якщо поточний статус "picked"
        const updateResult = await pool.query(
            `UPDATE shipment_process
             SET status = 'checked'
             WHERE id = $1 AND status = 'picked'`,
            [shipmentProcessId]
        );

        if (updateResult.rowCount === 0) {
            return res.status(400).json({
                error: 'Failed to update status. Item may have been already checked.',
            });
        }

        res.json({ message: 'Item successfully checked.' });
    } catch (err) {
        console.error('Error checking picked item:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCheckedShipments = async (req, res) => {
    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'checked'
             ORDER BY sp.created_at DESC`
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching checked shipments:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getCheckedShipmentsByOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const { rows } = await pool.query(
            `SELECT sp.*, p.sku, p.name, sl.zone, sl.x, sl.y, sl.z
             FROM shipment_process sp
             JOIN products p ON sp.product_id = p.id
             JOIN storage_locations sl ON sp.storage_location_id = sl.id
             WHERE sp.status = 'checked' AND sp.order_id = $1
             ORDER BY sp.created_at DESC`,
            [orderId]
        );

        res.json(rows);
    } catch (err) {
        console.error('Error fetching checked shipments by order:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
