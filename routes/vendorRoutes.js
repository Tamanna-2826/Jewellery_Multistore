const express = require('express');
const router = express.Router();

const vendorController = require('../controllers/vendorController');

router.post('/register',vendorController.vendorRegistration);
router.get('/pending', vendorController.getPendingVendors);
router.put('/activate/:vendor_id',vendorController.vendorActivation);
router.get('/active', vendorController.getactiveVendors);
router.put('/deactivate/:vendor_id', vendorController.vendorDeactivation);
router.get('/deactive', vendorController.getdeactiveVendors);
router.put('/update-password/:vendor_id', vendorController.updateVendorPassword);

module.exports = router;
