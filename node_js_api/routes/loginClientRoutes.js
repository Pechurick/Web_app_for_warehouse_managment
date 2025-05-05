const express = require('express');
const router = express.Router();
const loginClientController = require('../controllers/loginClientController');

router.post('/', loginClientController.loginClient); // Маршрут для логіну клієнта

module.exports = router;
