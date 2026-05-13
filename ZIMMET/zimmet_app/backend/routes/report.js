const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/reportController');

router.get('/', getDashboardData);

module.exports = router;
