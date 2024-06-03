const express = require('express');
const router = express.Router();
const { getAllCustomers,getVendorCustomers } = require('../controllers/customerController'); 

router.get('/admin', getAllCustomers);
router.get('/:vendor_id',getVendorCustomers);

module.exports = router;