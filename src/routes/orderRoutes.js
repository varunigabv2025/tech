const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.post('/:id/deliver', orderController.deliverOrder);
router.get('/', orderController.getOrders);

module.exports = router;
