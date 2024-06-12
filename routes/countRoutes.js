// File: routes/countRoutes.js

const express = require('express');
const router = express.Router();
const countController = require('../controllers/countController');

// Route to get counts
router.get('/admin', countController.getCountsForAdmin);
router.post('/vendor', countController.getCountsForVendor);


module.exports = router;
