const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, getUserReviews } = require('../controllers/reviewController');

router.post('/add', addReview);
router.get('/product/:product_id', getProductReviews);

module.exports = router;
