const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { jwtMiddleware, isAdmin } = require('../middleware/jwtMiddleware');
const multer = require('multer');
const upload = multer({dest:'uploads/banners/'});

// Public routes
router.get('/active', bannerController.getActiveBanners);
router.get('/all-banners', bannerController.getAllBanners);

router.get('/bannersByCategory/:category', bannerController.getBannersByCategory);

// Admin-only routes
router.post('/add', jwtMiddleware, isAdmin, upload.single('image_url'), bannerController.createBanner);

router.put('/update/:banner_id',upload.single('image_url'), bannerController.updateBanner);

router.delete('/delete/:banner_id', jwtMiddleware, isAdmin, bannerController.deleteBanner);

module.exports = router;