const { Wishlist, WishlistItem, Product } = require("../models");

const addItemToWishlist = async (req, res) => {
  const { user_id } = req.params;
  const { product_id } = req.body;

  try {
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ where: { user_id } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id });
    }

    const wishlistItem = await WishlistItem.create({
      wishlist_id: wishlist.wishlist_id,
      product_id: product_id,
    });
    res.status(201).json(wishlistItem);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while adding item to wishlist" });
  }
};

const removeItemFromWishlist = async (req, res) => {
  const { user_id} = req.params;
  const { product_id } = req.body;
  try {
    const wishlistItem = await WishlistItem.findOne({
      where: {
        product_id: product_id,
        "$wishlist.user_id$": user_id,
      },
      include: {
        model: Wishlist,
        as: "wishlist",
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({ error: "Wishlist item not found" });
    }

    await wishlistItem.destroy();
    res.status(200).json({ message: "Wishlist item removed successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while removing item from wishlist" });
  }
};

const getWishlistItems = async (req, res) => {
  const { user_id } = req.params;

  try {
    const wishlist = await Wishlist.findOne({
      where: { user_id },
      include: {
        model: WishlistItem,
        as: "wishlistItems",
        include: {
          model: Product,
          as: "product",
          attributes: [
            "product_id",
            "p_images",
            "product_name",
            "ratings",
            "selling_price",
            "mrp",
          ],
        },
      },
    });

    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    const wishlistItems = wishlist.wishlistItems.map((item) => ({
      product_id: item.product.product_id,
      p_images: item.product.p_images,
      product_name: item.product.product_name,
      ratings: item.product.ratings,
      selling_price: item.product.selling_price,
      mrp: item.product.mrp,
    }));

    res.status(200).json(wishlistItems);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching wishlist items" });
  }
};

module.exports = {
  addItemToWishlist,
  removeItemFromWishlist,
  getWishlistItems,
};
