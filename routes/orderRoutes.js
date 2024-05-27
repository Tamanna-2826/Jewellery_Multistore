const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/add',orderController.addOrder);
router.get('/:user_id', orderController.getOrderDetailsByUserId);
router.get('/detailed/:user_id/:order_id', orderController.getDetailedOrderDetails);
router.get('/admin/orders', orderController.getBasicOrderDetailsForAdmin);
router.get('/admin/orders/:order_id', orderController.getAdminDetailedOrderDetails); 
router.get('/vendors/:vendor_id/orders', orderController.getBasicOrderDetailsForVendor);
router.get('/:order_id/vendors/:vendor_id', orderController.getVendorDetailedOrderDetails);
router.put('/:order_id/orderItems/:orderItem_id/status', orderController.updateOrderItemStatus);


module.exports = router;
