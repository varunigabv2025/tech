const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, orderController.createOrder);
router.post('/:id/deliver', optionalAuth, orderController.deliverOrder);
router.get('/', optionalAuth, orderController.getOrders);

module.exports = router;
