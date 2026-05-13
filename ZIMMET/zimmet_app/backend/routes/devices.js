const express = require('express');
const router = express.Router();
const { getDevices, addDevice, updateDevice, deleteDevice } = require('../controllers/devicesController');

// Listeleme
router.get('/', getDevices);

// Ekleme
router.post('/', addDevice);

// Güncelleme
router.put('/:id', updateDevice);

// Silme
router.delete('/:id', deleteDevice);


module.exports = router;
