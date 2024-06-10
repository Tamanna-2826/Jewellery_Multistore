const express = require('express');
const router = express.Router();
const  WebsiteReviewController  = require('../controllers/wesiteReviewController');

router.post('/add', WebsiteReviewController.addWebsiteReview);
router.get('/approved', WebsiteReviewController.getApprovedReviews);
router.get('/pending', WebsiteReviewController.getPendingReviews);
router.get('/rejected', WebsiteReviewController.getRejectedReviews);
router.put('/:review_id', WebsiteReviewController.updateReviewStatus);

module.exports = router;
