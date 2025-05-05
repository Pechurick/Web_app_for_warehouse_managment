const express = require('express');
const router = express.Router();
const pickItemController = require('../controllers/pickItemController');

router.post('/', pickItemController.pickItem);
router.get('/', pickItemController.getPickedShipments);
router.get('/order/:orderId', pickItemController.getPickedShipmentsByOrder);

module.exports = router;
