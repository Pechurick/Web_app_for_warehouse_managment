const express = require('express');
const router = express.Router();
const storageLocationController = require('../controllers/storageLocationController');

// Отримати всі місця зберігання
router.get('/', storageLocationController.getAllStorageLocations);

// Додати нове місце зберігання
router.post('/', storageLocationController.addStorageLocation);

router.get('/get-id', storageLocationController.getStorageLocationId);

// Отримати одне місце зберігання за id
router.get('/:id', storageLocationController.getStorageLocationById);

router.delete('/:id', storageLocationController.deleteStorageLocation);

router.put('/:id', storageLocationController.updateStorageLocation);

module.exports = router;
