const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/categories/'  });

router.post('/add-categories', upload.single('category_image'),categoryController.addCategory);
router.get('/get-categories', categoryController.getAllCategories);
router.delete('/delete-category/:category_id', categoryController.softDeleteCategory);
router.put('/update-category/:category_id',upload.single('category_image'),categoryController.updateCategory); 

module.exports = router;
