const express = require('express');
const router = express.Router();
const { addReview, getProductReviews } = require('../controllers/reviewController');

router.post('/addOrUpdateReview', addReview);
router.get('/product/:product_id', getProductReviews);

module.exports = router;
