const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const scoreController = require('../controllers/scoreController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, invoiceController.createInvoice);
router.get('/', optionalAuth, invoiceController.getInvoices);
router.get('/:id', optionalAuth, invoiceController.getInvoiceById);
router.post('/:id/verify', optionalAuth, invoiceController.verifyInvoice);
router.get('/:id/score', optionalAuth, scoreController.calculateScore);

module.exports = router;
