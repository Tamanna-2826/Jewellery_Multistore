const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

router.post('/add-shipping-address', addressController.addShippingAddress);
router.post('/add-billing-address',addressController.addBillingAddress);
router.put('/set-default/:address_id', addressController.updateDefaultAddress);
router.get('/users/:user_id/', addressController.getAddresses); 

module.exports = router;
