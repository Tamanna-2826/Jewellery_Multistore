const express = require('express');
const router = express.Router();
const { jwtMiddleware } = require('../middleware/jwtMiddleware');

const { userLogin,vendorLogin,adminLogin,getUserProfile,userRegister,updateUser } = require('../controllers/authController');

router.post('/user-login', userLogin);
router.post('/vendor-login',vendorLogin);
router.post('/admin-login', adminLogin);
router.post('/register/user', userRegister);
router.get('/profile', jwtMiddleware, getUserProfile);
router.put('/update', jwtMiddleware, updateUser);


module.exports = router;
