const express = require('express');
const router = express.Router();
const aaConsentController = require('../controllers/aaConsentController');

router.get('/units', aaConsentController.listUnits);
router.post('/consent', aaConsentController.createConsent);
router.get('/consent/unit/:unitId', aaConsentController.getLatestConsentForUnit);
router.get('/consent/:id', aaConsentController.getConsent);
router.post('/consent/:id/approve', aaConsentController.approveConsent);
router.post('/consent/:id/reject', aaConsentController.rejectConsent);

module.exports = router;
