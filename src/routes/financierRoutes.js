const express = require('express');
const router = express.Router();
const financierController = require('../controllers/financierController');

router.get('/invoices', financierController.listFinancierInvoices);
router.get('/invoices/:id', financierController.getFinancierInvoice);
router.post('/invoices/:id/accept', financierController.acceptInvoice);
router.post('/invoices/:id/settle', financierController.settleInvoice);
router.post('/invoices/:id/decline', financierController.declineInvoice);

module.exports = router;
