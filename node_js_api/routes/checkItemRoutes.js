const express = require('express');
const router = express.Router();
const checkItemController = require('../controllers/checkItemController');

router.get('/order', checkItemController.getCheckedShipments);

router.get('/order/:orderId', checkItemController.getCheckedShipmentsByOrder);
router.post('/order/:orderId', checkItemController.checkPickedItem);

module.exports = router;
