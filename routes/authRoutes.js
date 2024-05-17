const express = require('express');
const router = express.Router();

const { userLogin,vendorLogin,adminLogin } = require('../controllers/authController');

router.post('/user-login', userLogin);
router.post('/vendor-login',vendorLogin);
router.post('/admin-login', adminLogin);


module.exports = router;
