const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const scoreController = require('../controllers/scoreController');

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/:id/verify', invoiceController.verifyInvoice);
router.get('/:id/score', scoreController.calculateScore);

module.exports = router;
