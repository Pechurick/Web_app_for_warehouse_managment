const express = require('express');
const router = express.Router();
const shippedItemController = require('../controllers/shippedItemController');

router.get('/order', shippedItemController.getShippedShipments);

router.post('/order/:orderId', shippedItemController.shipPickedItem);
router.get('/order/:orderId', shippedItemController.getShippedShipmentsByOrder);

module.exports = router;
