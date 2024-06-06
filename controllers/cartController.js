const {
  Cart,
  Category,
  CartItem,
  Product,
  User,
  Wishlist,
  WishlistItem,
} = require("../models");

const addToCart = async (req, res) => {
  const { user_id, product_id, quantity, price, size } = req.body;


  try {
    const product = await Product.findByPk(product_id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_name"],
        },
      ],
    });
    const user = await User.findByPk(user_id);

    if (!product || !user) {
      return res.status(404).json({ error: "Product or User not found" });
    }

    const category = product.category;

    if (
      (category.category_name === "Bangles" ||
        category.category_name === "Ring") &&
      (!size || size.trim() === "")
    ) {
      return res
        .status(400)
        .json({ error: "Size is required for bangles and rings" });
    }

    let cart = await Cart.findOne({ where: { user_id } });
    if (!cart) {
      cart = await Cart.create({ user_id });
    }

    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id,
      },
    });

    if (cartItem) {
      const updatedQuantity = cartItem.quantity + quantity;
      const updatedSubTotal = (updatedQuantity * price).toFixed(2);
      await cartItem.update({
        quantity: updatedQuantity,
        subTotal: updatedSubTotal,
      });
    } else {
      const subTotal = (quantity * price).toFixed(2);

      cartItem = await CartItem.create({
        cart_id: cart.cart_id,
        product_id,
        size,
        quantity,
        price,
        subTotal,
      });
    }

    const userCartItems = await CartItem.findAll({
      where: { cart_id: cart.cart_id },
    });
    let total = 0;
    for (const item of userCartItems) {
      const subtotal = parseFloat(item.subTotal);
      if (!isNaN(subtotal)) {
        total += subtotal;
      }
    }
 

    await CartItem.update({ total }, { where: { cart_id: cart.cart_id } });
    return res.status(200).json({
      message: "Item added to cart successfully",
      cartItem,
      total
    });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const removeFromCartByItemId = async (req, res) => {
  const { cartItem_id } = req.body;

  try {
    const cartItem = await CartItem.findByPk(cartItem_id);

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }
    const cart_id = cartItem.cart_id;
    const deletedSubtotal = cartItem.subTotal;

    await cartItem.destroy();

    await CartItem.decrement("total", {
      by: deletedSubtotal,
      where: { cart_id: cart_id },
    });

    return res.status(200).json({
      message: "Product removed from cart successfully",
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getCartItemsByUserId = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cartItems = await CartItem.findAll({
      where: {},
      include: [
        {
          model: Cart,
          as: "cart",
          attributes: ["cart_id"],
          where: {
            user_id: user_id,
          },
          paranoid: true,
        },
        {
          model: Product,
          as: "product",
        },
      ],
      paranoid: true,
    });
    let total = 0;

    for (const item of cartItems) {
      const subtotal = parseFloat(item.subTotal);
      if (!isNaN(subtotal)) {
        total += subtotal;
      }
    }

    total = total.toFixed(2);
 
    return res.status(200).json({
      cartItems,
      total,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const moveProductToWishlist = async (req, res) => {
  const { user_id } = req.params;
  const { cartItem_id } = req.body;

  try {
    const cartItem = await CartItem.findByPk(cartItem_id, {
      include: { model: Cart, as: "cart", where: { user_id } },
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const existingWishlistItem = await WishlistItem.findOne({
      where: { product_id: cartItem.product_id },
    });

    if (existingWishlistItem) {
      await cartItem.destroy();

      return res.status(200).json({
        message: "Product already exists in wishlist",
        wishlistItem: existingWishlistItem,
      });
    }

    let wishlist = await Wishlist.findOne({ where: { user_id } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id });
    }

    const wishlistItem = await WishlistItem.create({
      wishlist_id: wishlist.wishlist_id,
      product_id: cartItem.product_id,
      size: cartItem.size,
      quantity: cartItem.quantity,
      price: cartItem.price,
      subTotal: cartItem.subTotal,
    });

    await cartItem.destroy();

    return res.status(200).json({
      message: "Product moved to wishlist successfully",
      wishlistItem,
    });
  } catch (error) {
    console.error("Error moving product to wishlist:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  addToCart,
  removeFromCartByItemId,
  getCartItemsByUserId,
  moveProductToWishlist,
};
