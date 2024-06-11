const express = require('express');
const router = express.Router();
const { addOrUpdateReview, getProductReviews,getUserProductReviews } = require('../controllers/reviewController');

router.post('/add', addOrUpdateReview);
router.get('/product/:product_id', getProductReviews);
router.post('/user-product-reviews', getUserProductReviews);

module.exports = router;
