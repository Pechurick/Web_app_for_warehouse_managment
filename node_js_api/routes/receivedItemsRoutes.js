const express = require('express'); // Імпортуємо бібліотеку Express
const router = express.Router(); // Імпортуємо бібліотеку Express та створюємо маршрутизатор
const receivedItemsController = require('../controllers/receivedItemsController'); // Імпортуємо контролер для отриманих товарів

// Маршрут для додавання нового товару в received_items
router.post('/', receivedItemsController.addReceivedItemBySku); // Додати новий товар за SKU
router.get('/', receivedItemsController.getAllReceivedItems);
router.get('/:sku', receivedItemsController.getReceivedItemBySku);
router.delete('/:sku', receivedItemsController.deleteReceivedItemBySku);
router.put('/:sku', receivedItemsController.updateReceivedItemBySku);

module.exports = router;
