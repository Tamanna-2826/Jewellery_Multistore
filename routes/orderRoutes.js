const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/add',orderController.addOrder);
router.get('/:user_id', orderController.getOrderDetailsByUserId);
router.get('/detailed/:user_id/:order_id', orderController.getDetailedOrderDetails);
router.get('/admin/orders', orderController.getBasicOrderDetailsForAdmin);
router.get('/admin/orders/:order_id', orderController.getAdminDetailedOrderDetails); // Add this line


module.exports = router;
