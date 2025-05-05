const express = require('express'); // Імпортуємо бібліотеку Express
const router = express.Router(); // Створюємо маршрутизатор
const productsController = require('../controllers/productsController'); // Імпортуємо контролер для продуктів

router.get('/', productsController.getAllProducts); // Отримати всі продукти
router.post('/', productsController.createProduct); // Додати новий продукт
router.get('/:id', productsController.getProductById); // Отримати продукт за ID
router.put('/:id', productsController.updateProductById); // Оновити продукт за ID
router.delete('/:id', productsController.deleteProductById); // Видалити продукт за ID
router.get('/get-id-by-sku/:sku', productsController.getProductIdBySku); // Отримати ID продукту за SKU

module.exports = router; // Експортуємо маршрути для використання в index.js
