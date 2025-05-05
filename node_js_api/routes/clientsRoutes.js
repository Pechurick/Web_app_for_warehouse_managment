const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

router.post('/', clientsController.createClient);
router.get('/', clientsController.getAllClients); // Отримати всіх клієнтів
// Отримати одного клієнта за id
router.get('/:id', clientsController.getClientById);
router.delete('/:id', clientsController.deleteClient);
router.put('/:id', clientsController.updateClient);

module.exports = router;
