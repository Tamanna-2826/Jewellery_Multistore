const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// Route to add item to wishlist
router.post('/add/:user_id', wishlistController.addItemToWishlist);

// Route to remove item from wishlist
router.delete('/remove/:user_id', wishlistController.removeItemFromWishlist);

// Route to get wishlist items for a user
router.get('/:user_id', wishlistController.getWishlistItems);

module.exports = router;
