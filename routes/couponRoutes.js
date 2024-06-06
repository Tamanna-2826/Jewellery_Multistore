const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');

router.post('/add', couponController.createCoupon);

router.get('/vendor/:vendor_id', couponController.getCouponsForVendor);

router.put('/update/:coupon_id', couponController.updateCoupon);

router.delete('/delete/:coupon_id', couponController.deleteCoupon);

router.get('/carts/:cart_id/applicable-coupons', couponController.getApplicableCoupons);


module.exports = router;