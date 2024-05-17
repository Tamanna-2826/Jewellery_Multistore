const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cartController');

router.post("/add", cartController.addToCart);
router.delete("/remove", cartController.removeFromCartByItemId);
router.get("/:user_id", cartController.getCartItemsByUserId);
router.post('/move-to-wishlist/:user_id', cartController.moveProductToWishlist);


module.exports = router;