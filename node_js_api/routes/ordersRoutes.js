// routes/orders.js
const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');

router.post('/', ordersController.createOrder);
router.get('/', ordersController.getAllOrdersWithClients); // Отримати всі замовлення
router.get('/:id', ordersController.getOrderWithClientById); // Отримати замовлення за ID
router.put('/:id/status', ordersController.updateOrderStatus);

router.get('/:id/status/:status', ordersController.getOrderByIdAndStatus); // Оновити статус замовлення
router.get('/status/:status', ordersController.getOrdersByStatus);

router.get('/items/:id/locations', ordersController.getOrderPickList); // Отримати всі замовлення
router.get('/items/client/:clientId', ordersController.getClientOrders);
router.delete('/:orderId', ordersController.deleteOrder);
router.get('/items/:orderId', ordersController.getOrderByIdForClient);
router.put('/items/:orderId', ordersController.updateOrder);
module.exports = router;
