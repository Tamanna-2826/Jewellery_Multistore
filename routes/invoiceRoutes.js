const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Route to download an invoice
router.get('/:order_id/invoice', invoiceController.downloadInvoice);
router.get('/:order_id/:vendor_id', invoiceController.downloadVendorInvoice);

module.exports = router;