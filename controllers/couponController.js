const { Coupon, Vendor, Cart, CartItem,Product  } = require("../models");
const { Op } = require('sequelize'); 

const createCoupon = async (req, res) => {
    const { vendor_id, code, discount_type, discount_value, minimum_amount, maximum_uses, expiry_date } = req.body;
  
    try {
      const existingCoupon = await Coupon.findOne({ where: { code } });
      if (existingCoupon) {
        return res.status(409).json({ message: "Coupon code already exists" });
      }
  
      const coupon = await Coupon.create({
        vendor_id,
        code,
        discount_type,
        discount_value,
        minimum_amount,
        maximum_uses,
        expiry_date,
      });
  
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

// Get all coupons for a vendor
const getCouponsForVendor = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const coupons = await Coupon.findAll({
      where: { vendor_id },
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["first_name","last_name", "email"],
        },
      ],
    });

    res.json(coupons);
  } catch (error) {
    console.error("Error getting coupons:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateCoupon = async (req, res) => {
  const { coupon_id } = req.params;
  const {  code, discount_type, discount_value,  minimum_amount,  maximum_uses, expiry_date } = req.body;

  try {
    const coupon = await Coupon.findByPk(coupon_id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.code = code || coupon.code;
    coupon.discount_type = discount_type || coupon.discount_type;
    coupon.discount_value = discount_value || coupon.discount_value;
    coupon.minimum_amount = minimum_amount || coupon.minimum_amount;
    coupon.maximum_uses = maximum_uses || coupon.maximum_uses;
    coupon.expiry_date = expiry_date || coupon.expiry_date;

    await coupon.save();

    res.json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const deleteCoupon = async (req, res) => {
  const { coupon_id } = req.params;

  try {
    const coupon = await Coupon.findByPk(coupon_id);

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await coupon.destroy();

    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getApplicableCoupons = async (req, res) => {
  const { cart_id } = req.params;

  try {
    const cart = await Cart.findByPk(cart_id, {
      include: [
        {
          model: CartItem,
          as: 'cartItems',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['selling_price'],
              include: [
                {
                  model: Vendor,
                  as: 'vendor',
                  attributes: ['vendor_id']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const totalAmount = cart.cartItems.reduce((sum, item) => {
      const price = parseFloat(item.product.selling_price);
      return isNaN(price) ? sum : sum + price;
    }, 0);

    const vendorIds = Array.from(new Set(cart.cartItems.map(item => item.product.vendor.vendor_id)));

    const applicableCoupons = await Coupon.findAll({
      where: {
        vendor_id: { [Op.in]: vendorIds }, 
        minimum_amount: {
          [Op.lte]: totalAmount 
        },
        maximum_uses: {
          [Op.gt]: 0 
        },
        expiry_date: {
          [Op.gte]: new Date() 
        }
      },
      include: [
        {
          model: Vendor,
          as: 'vendor',
          attributes: ['first_name', 'last_name', 'email']
        }
      ]
    });

    res.json(applicableCoupons);
  } catch (error) {
    console.error('Error getting applicable coupons:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  createCoupon,
  getCouponsForVendor,
  updateCoupon,
  deleteCoupon,
  getApplicableCoupons
};