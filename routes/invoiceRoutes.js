const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// Route for downloading an invoice
router.get('/download-invoice/:invoiceId', invoiceController.downloadInvoice);

module.exports = router;
