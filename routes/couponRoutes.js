const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/add', couponController.createCoupon);

router.get('/vendor/:vendor_id', couponController.getCouponsForVendor);

router.put('/:coupon_id', couponController.updateCoupon);

router.delete('/:coupon_id', couponController.deleteCoupon);

module.exports = router;