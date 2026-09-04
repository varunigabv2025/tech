const express = require('express');
const router = express.Router();
const tredsController = require('../controllers/tredsController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/packages', optionalAuth, tredsController.listPackages);
router.post('/invoices/:id/package', optionalAuth, tredsController.sendToTreds);
router.get('/invoices/:id/package', optionalAuth, tredsController.getPackage);

module.exports = router;
