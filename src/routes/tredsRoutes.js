const express = require('express');
const router = express.Router();
const tredsController = require('../controllers/tredsController');

router.get('/packages', tredsController.listPackages);
router.post('/invoices/:id/package', tredsController.sendToTreds);
router.get('/invoices/:id/package', tredsController.getPackage);

module.exports = router;
