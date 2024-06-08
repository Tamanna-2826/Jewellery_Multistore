const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/products/'  });

router.post('/add', upload.array("p_images"),  productController.addProduct);

router.get('/', productController.getAllProducts);

router.delete('/deactivate/:product_id', productController.softDeleteProduct);

router.get('/by-category/:category_id', productController.getProductsByCategory);

router.get('/details/:product_id', productController.getProductDetails);

router.get('/vendor/:vendor_id', productController.getProductsByVendor);

router.get('/same-category/:product_id', productController.getProductsBySameCategory);

router.get('/same-vendor/:product_id', productController.getProductsBySameVendor);
router.put('/update/:product_id',upload.array("p_images"), productController.updateProduct);

router.get('/search', productController.searchProducts);
router.get('/filter', productController.filterProducts);
router.get('/bestsellers', productController.getBestSellingProducts);
router.get('/trending', productController.getTrendingProducts);
router.get('/recent', productController.getRecentProducts);





module.exports = router;
