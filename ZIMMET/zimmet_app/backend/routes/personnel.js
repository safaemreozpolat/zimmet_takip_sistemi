const express = require('express');
const router = express.Router();
const { 
  getPersonnel, 
  addPersonnel, 
  updatePersonnel, 
  getPersonnelWithDevices 
} = require('../controllers/personnelController');

// Personel listeleme
router.get('/', getPersonnel);

// Personel ekleme
router.post('/', addPersonnel);

// Personel güncelleme
router.put('/:id', updatePersonnel);

// Personel + cihaz atamaları
router.get('/with-devices', getPersonnelWithDevices);

module.exports = router;
