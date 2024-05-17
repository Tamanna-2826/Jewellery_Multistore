const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/products/'  });


// router.post('/add', upload.array("p_images"), productController.addProduct);
// router.get('/get-products', productController.getAllProducts);
// router.delete('/delete-product/:product_id', productController.softDeleteProduct);
// router.get("/get-products/:category_id", productController.getProductsByCategory);

// // Route to add a product
router.post('/add', upload.array("p_images"),  productController.addProduct);

// // Route to get all products
router.get('/', productController.getAllProducts);

// // Route to soft delete a product
router.delete('/deactivate/:product_id', productController.softDeleteProduct);

// // Route to get products by category
router.get('/by-category/:category_id', productController.getProductsByCategory);

// // Route to get product details by product ID
router.get('/details/:product_id', productController.getProductDetails);

// Route to fetch products by vendor
router.get('/vendor/:vendor_id', productController.getProductsByVendor);

// Route to fetch all products of the same category as the specified product ID
router.get('/same-category/:product_id', productController.getProductsBySameCategory);

// Route to fetch all products from the same vendor as the specified product ID
router.get('/same-vendor/:product_id', productController.getProductsBySameVendor);

//update
router.put('/update/:product_id',upload.array("p_images"), productController.updateProduct);



module.exports = router;
