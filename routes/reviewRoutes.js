const express = require('express');
const router = express.Router();
const { addOrUpdateReview, getProductReviews } = require('../controllers/reviewController');

router.post('/add', addOrUpdateReview);
router.get('/product/:product_id', getProductReviews);

module.exports = router;
