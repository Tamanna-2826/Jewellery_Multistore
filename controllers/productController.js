const { Product, Vendor, Category, State } = require("../models");
const { sendEmail } = require("../helpers/emailHelper");
const cloudinary = require("../config/cloudinaryConfig");

const addProduct = async (req, res) => {
  try {
    const {
      category_id,
      vendor_id,
      product_name,
      main_description,
      mrp,
      selling_price,
      vendor_price,
      clasp_type,
      gem_type,
      gem_color,
      occasion_type,
      size,
      basic_description,
      gold_type,
      no_of_gems,
      purity,
      weight,
    } = req.body;

    console.log("CAT ID : ", req.body.category_id);

    const productImages = [];

    const vendor = await Vendor.findByPk(vendor_id);
    if (!vendor) {
      return res.status(400).json({ error: "Vendor not found" });
    }

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(400).json({ error: "Category not found" });
    }

    const existingProduct = await Product.findOne({
      where: { product_name },
    });
    if (existingProduct) {
      return res.status(400).json({ error: "Product already exists" });
    }

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
      });
      productImages.push(result.public_id);
    }
    const newProduct = await Product.create({
      category_id,
      vendor_id,
      product_name,
      main_description,
      mrp,
      selling_price,
      vendor_price,
      clasp_type,
      gem_type,
      gem_color,
      occasion_type,
      size,
      basic_description,
      gold_type,
      no_of_gems,
      purity,
      weight,
      p_images: productImages,
    });

    res
      .status(200)
      .json({ message: "Image uploaded Successfully ", newProduct });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    products.forEach((product) => {
      if (product.p_images && product.p_images.length > 0) {
        const imageUrls = product.p_images.map((publicId) => {
          return `https://res.cloudinary.com/dyjgvi4ma/image/upload/products/${publicId}`;
        });
        product.imageURLs = imageUrls;
      }
    });

    res
      .status(200)
      .json({ message: "Products are fetched successfullt", data: products });
  } catch (error) {
    console.error(
      "Error fetching products with images from Cloudinary:",
      error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const softDeleteProduct = async (req, res) => {
  const { product_id } = req.params;
  if (isNaN(product_id)) {
    return res.status(400).json({ error: "productID must be an integer" });
  }
  try {
    const product = await Product.findOne({
      where: { product_id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.destroy();

    const vendor = await Vendor.findOne({
      where: { vendor_id: product.vendor_id }, // Assuming role 3 is for vendors
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const imageUrl = `https://res.cloudinary.com/dyjgvi4ma/image/upload/${product.p_images[0]}`;

    const htmlContent = `
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 10px;
                width: 100%;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
    
            .container {
                max-width: 600px;
                padding: 10px;
                border-radius: 10px;
                background-color: #f5f5f5;
            }
    
            .header {
                color: black;
                text-align: center;
                padding: 10px;
            }
    
            .content {
                padding: 20px;
            }
    
            .footer {
                color: black;
                text-align: center;
                padding: 10px;
                background-color: #d7d3d3; /* Light grey background color */
                border-radius: 3px;
    
            }
        </style>
    </head>
    
    <body>
    <div class="container">
        <div class="header">
            <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/dgg9v84gtpn3drrp8qce" height="300px" width="350px"></h2>
            <h1 style="margin-top: 0;">Product Deactivation Notification</h1>
        </div>
        <div class="content">
            <p>
                Dear ${vendor.first_name},
            </p>
            <p>
            We regret to inform you that one of your products on Sarvadhi Solutions has been deactivated by our administrative team. <br>
            </p>
            <p>
            The deactivated product is: <br>
             Product Name: ${product.product_name}<br>
                Price: ${product.selling_price} Rs. <br>
                Image:<br>
                 <img src="${imageUrl}" alt="Product Image" height="150px" width="150px"><br> 
            </p>
          <p>Please note that during this deactivation period, customers will not be able to purchase or view this product on our website.
          If you believe this deactivation was made in error or have any concerns, please reach out to us at admin@gmail.com, and we will be happy to review your case.
          Thank you for your understanding. <br>
          Best regards,
          The Sarvadhi Solutions Team
          <p>Thank you</p>

        </div>
        <div class="footer">
        If you have any questions, please contact our support team at projectsarvadhi@gmail.com
        </div>
    </div>
    </body>
    </html>
   `;
    sendEmail(vendor.email, "Product Deletion Notification", htmlContent);
    res.json({ message: "Product soft-deleted successfully" });
  } catch (error) {
    console.error("Error soft-deleting Product:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;

    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    const products = await Product.findAll({
      where: { category_id },
    });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }

    products.forEach((product) => {
      if (product.p_images && product.p_images.length > 0) {
        const imageUrls = product.p_images.map((publicId) => {
          return `https://res.cloudinary.com/dyjgvi4ma/image/upload/products/${publicId}`;
        });
        product.imageURLs = imageUrls;
      }
    });

    res
      .status(200)
      .json({ message: "Products fetched successfully", data: products });
  } catch (error) {
    console.error("Error fetching products by category:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await Product.findByPk(product_id, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["vendor_id", "first_name", "last_name", "email"],
          include: [
            {
              model: State,
              as: "state",
              attributes: ["state_name"],
            },
          ],
        },
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "category_name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const imageUrls = product.p_images.map((publicId) => {
      return `https://res.cloudinary.com/dyjgvi4ma/image/upload/${publicId}`;
    });

    res.status(200).json({
      message: "Product details fetched successfully",
      data: {
        product_id: product.product_id,
        product_name: product.product_name,
        vendor: {
          vendor_id: product.vendor.vendor_id,
          vendor_name:
            product.vendor.first_name + " " + product.vendor.last_name,
          email: product.vendor.email,
          state_name: product.vendor.state
            ? product.vendor.state.state_name
            : null,
        },
        category: {
          category_id: product.category.category_id,
          category_name: product.category.category_name,
        },
        main_description: product.main_description,
        mrp: product.mrp,
        selling_price: product.selling_price,
        vendor_price: product.vendor_price,
        clasp_type: product.clasp_type,
        gem_type: product.gem_type,
        gem_color: product.gem_color,
        occasion_type: product.occasion_type,
        size: product.size,
        basic_description: product.basic_description,
        gold_type: product.gold_type,
        no_of_gems: product.no_of_gems,
        purity: product.purity,
        weight: product.weight,
        imageURLs: imageUrls,
      },
    });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductsByVendor = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const vendorProducts = await Product.findAll({
      where: { vendor_id },
    });

    if (vendorProducts.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this vendor" });
    }
    const productsWithImageUrls = vendorProducts.map((product) => {
      const imageUrls = product.p_images.map((publicId) => {
        return `https://res.cloudinary.com/dyjgvi4ma/image/upload/products/${publicId}`;
      });
      return {
        ...product.toJSON(),
        imageURLs: imageUrls,
      };
    });

    res.status(200).json({
      message: "Products fetched successfully",
      data: productsWithImageUrls,
    });
  } catch (error) {
    console.error("Error fetching products by vendor:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductsBySameCategory = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const category_id = product.category_id;
    const products = await Product.findAll({
      where: { category_id },
    });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found in the same category" });
    }

    const productsWithImageUrls = products.map((product) => {
      const imageUrls = product.p_images.map((publicId) => {
        return `https://res.cloudinary.com/dyjgvi4ma/image/upload/products/${publicId}`;
      });
      return {
        ...product.toJSON(),
        imageURLs: imageUrls,
      };
    });

    res.status(200).json({
      message: "Products fetched successfully",
      data: productsWithImageUrls,
    });
  } catch (error) {
    console.error(
      "Error fetching products by the same category:",
      error.message
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getProductsBySameVendor = async (req, res) => {
  try {
    const { product_id } = req.params;

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const vendor_id = product.vendor_id;

    const products = await Product.findAll({
      where: { vendor_id },
    });

    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found for this vendor" });
    }

    const productsWithImageUrls = products.map((product) => {
      const imageUrls = product.p_images.map((publicId) => {
        return `https://res.cloudinary.com/dyjgvi4ma/image/upload/products/${publicId}`;
      });
      return {
        ...product.toJSON(),
        imageURLs: imageUrls,
      };
    });

    res.status(200).json({
      message: "Products fetched successfully",
      data: productsWithImageUrls,
    });
  } catch (error) {
    console.error("Error fetching products by the same vendor:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateProduct = async (req, res) => {
  const { product_id } = req.params;

  try {
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const {
      category_id,
      vendor_id,
      product_name,
      main_description,
      mrp,
      selling_price,
      vendor_price,
      clasp_type,
      gem_type,
      gem_color,
      occasion_type,
      size,
      basic_description,
      gold_type,
      no_of_gems,
      purity,
      weight,
    } = req.body;

    product.category_id = category_id;
    product.vendor_id = vendor_id;
    product.product_name = product_name;
    product.main_description = main_description;
    product.mrp = mrp;
    product.selling_price = selling_price;
    product.vendor_price = vendor_price;
    product.clasp_type = clasp_type;
    product.gem_type = gem_type;
    product.gem_color = gem_color;
    product.occasion_type = occasion_type;
    product.size = size;
    product.basic_description = basic_description;
    product.gold_type = gold_type;
    product.no_of_gems = no_of_gems;
    product.purity = purity;
    product.weight = weight;

    const productImages = [...product.p_images];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        productImages.push(result.public_id);
      }
    }

    if (req.body.existingImages) {
      const existingImages = JSON.parse(req.body.existingImages);
      productImages.push(...existingImages);
    }

    product.p_images = productImages;

    await product.save();

    res.json({
      message: "Product updated successfully",
      updatedProduct: product,
    });
  } catch (error) {
    console.error("Error updating product details:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  softDeleteProduct,
  getProductsByCategory,
  getProductDetails,
  getProductsByVendor,
  getProductsBySameCategory,
  getProductsBySameVendor,
  updateProduct,
};
