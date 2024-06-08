const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Route to download an invoice
router.get('/:order_id/invoice', invoiceController.downloadInvoice);

module.exports = router;