const express = require('express'); // Імпортуємо бібліотеку Express
const router = express.Router(); // Імпортуємо бібліотеку Express та створюємо маршрутизатор
const usersController = require('../controllers/usersController'); // Імпортуємо контролер для користувачів

router.get('/', usersController.getAllUsers); // Отримати всіх користувачів

router.post('/', usersController.createUser); // Додати нового користувача
router.get('/:id', usersController.getUserById); // Отримати одного користувача за ID
router.delete('/:id', usersController.deleteUser); // Видалити користувача за ID
router.put('/:id', usersController.updateUser); // Оновити користувача за ID

module.exports = router; // Експортуємо маршрути для використання в index.js
