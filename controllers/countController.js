const { Product, Category, User, Vendor, Order, OrderItem,Coupon } = require('../models');

const getCountsForAdmin = async (req, res) => {
    try {
        const productCount = await Product.count();
        const categoryCount = await Category.count();
        const userCount = await User.count();
        const activeVendorCount = await Vendor.count({ where: { active_status: 'active' } });
        const orderCount = await Order.count();

        res.json({
            products: productCount,
            categories: categoryCount,
            users: userCount,
            activeVendors: activeVendorCount,
            orders: orderCount,
        });
    } catch (error) {
        console.error('Error:', error); 
        res.status(500).json({ error: 'Failed to get counts' });
    }
};

const getCountsForVendor = async (req, res) => {
    const { vendor_id } = req.body;

    try {
        const vendor = await Vendor.findByPk(vendor_id, {
            include: [
                {
                    model: Product,
                    as: 'products',
                    include: [
                        {
                            model: OrderItem,
                            as: 'orderItems',
                            include: [
                                {
                                    model: Order,
                                    as: 'order',
                                    include: [
                                        {
                                            model: User,
                                            as: 'user',
                                            attributes: ['user_id']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    model: Coupon,
                    as: 'coupons'
                }
            ]
        });

        if (!vendor) {
            return res.status(404).json({ error: `Vendor with id ${vendor_id} not found` });
        }

        const userIds = new Set();
        const orders = [];

        vendor.products.forEach(product => {
            product.orderItems.forEach(orderItem => {
                orders.push(orderItem.order);
                userIds.add(orderItem.order.user.user_id);
            });
        });

        const totalProducts = vendor.products.length;
        const totalCoupons = vendor.coupons.length;

        return res.json({
            totalUsers: userIds.size,
            totalOrders: orders.length,
            totalProducts,
            totalCoupons
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching vendor stats' });
    }
};

module.exports = {
    getCountsForAdmin,
    getCountsForVendor
};