const express = require('express');
const router = express.Router();
const placedItemsController = require('../controllers/placedItemsController');

// POST: розмістити товар
router.post('/', placedItemsController.addPlacedItem); // Створити новий розміщений товар
router.get('/', placedItemsController.getAllPlacedItems); // Отримати всі розміщені товари
router.get('/by-sku', placedItemsController.getPlacedItemsBySku); // Отримати розміщені товари за SKU
router.get('/by-location', placedItemsController.getPlacedItemsByLocation);
router.delete('/remove', placedItemsController.removeQuantityFromPlacedItem); // Видалити кількість з розміщеного товару
router.post('/move', placedItemsController.moveItemBetweenLocations); // Перемістити товар між місцями зберігання
router.get('/public', placedItemsController.getPublicPlacedItems); // Отримати всі розміщені товари для публічного доступу
router.get('/:id', placedItemsController.getPlacedItemsById);
router.get('/public/:sku', placedItemsController.getPublicPlacedItemBySku);

module.exports = router;
