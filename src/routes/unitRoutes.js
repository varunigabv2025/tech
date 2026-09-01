const express = require('express');
const router = express.Router();
const unitController = require('../controllers/unitController');

router.post('/', unitController.createUnit);

module.exports = router;
