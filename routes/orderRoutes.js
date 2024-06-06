const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { jwtMiddleware } = require('../middleware/jwtMiddleware');

router.get('/:user_id', orderController.getOrderDetailsByUserId);
router.get('/detailed/:user_id/:order_id', orderController.getDetailedOrderDetails);
router.get('/admin/orders', orderController.getBasicOrderDetailsForAdmin);
router.get('/admin/orders/:order_id', orderController.getAdminDetailedOrderDetails); 
router.get('/vendors/:vendor_id/orders', orderController.getBasicOrderDetailsForVendor);
router.get('/:order_id/vendors/:vendor_id', orderController.getVendorDetailedOrderDetails);
router.put('/vendor/:order_id/item/:orderItem_id/status',jwtMiddleware, orderController.updateVendorOrderItemStatus);
router.put('/admin/order/:order_id/status', jwtMiddleware,orderController.updateAdminOrderStatus);
router.get('/:order_id/status',orderController.getStatusForAdmin);
router.get('/order-items/:orderItem_id/status',orderController.getStatusForVendor);

module.exports = router;
