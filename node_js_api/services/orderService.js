// services/orderService.js
const pool = require('../db');

const getOrderPickList = async (orderId) => {
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

        const placedRes = await pool.query(
            `SELECT pi.quantity, sl.zone, sl.x, sl.y, sl.z
         FROM placed_items pi
         JOIN storage_locations sl ON pi.storage_location_id = sl.id
         WHERE pi.product_id = $1 AND pi.quantity > 0
         ORDER BY pi.quantity DESC`,
            [product_id]
        );

        let remaining = quantity;

        for (const place of placedRes.rows) {
            if (remaining <= 0) break;

            const take = Math.min(place.quantity, remaining);
            result.push({
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
    }

    return result;
};

module.exports = { getOrderPickList };
