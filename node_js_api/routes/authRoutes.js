const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // Імпортуємо контролер для авторизації
const { authenticateToken } = require('../middleware/authMiddleware'); // Імпортуємо мідлвер для перевірки токену

// Маршрут для логіну
router.post('/login', authController.loginUser);
router.get('/protected', authenticateToken, authController.getProtectedData);

module.exports = router;
