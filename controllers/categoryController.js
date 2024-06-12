const { Category, Product } = require("../models");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require('fs');
const path = require('path');

const addCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).json({ message: "Category Name cannot be empty" });
    }

    const existingCat = await Category.findOne({ where: { category_name } });
    if (existingCat) {
      return res.status(400).json({ message: "Category Already Exists" });
    }

    let categoryImage = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });

      categoryImage = result.public_id;

       const filePath = path.join(__dirname, '..', req.file.path);
       fs.unlinkSync(filePath);
     
    }

    const newCat = await Category.create({
      category_name,
      category_image: categoryImage,
    });

    res .status(200).json({ message: "Category created successfully", data: newCat });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    if (categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    categories.forEach((category) => {
      if (category.category_image) {
        category.imageURL = `https://res.cloudinary.com/dyjgvi4ma/image/upload/categories/${category.category_image}`;
      }
    });

    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories with images:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const softDeleteCategory = async (req, res) => {
  const { category_id } = req.params;

  if (isNaN(category_id)) {
    return res.status(400).json({ error: "categoryID must be an integer" });
  }
  try {
    const deletedCat = await Category.destroy({
      where: {
        category_id: category_id,
      },
    });

    if (deletedCat === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    await Product.destroy({ where: { category_id } });

    res
      .status(200)
      .json({
        message: "Category and associated items soft deleted successfully",
      });
  } catch (error) {
    console.error("Error soft deleting Category:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateCategory = async (req, res) => {
  const categoryId = req.params.category_id;
  const { category_name } = req.body;

  try {
    if (!category_name) {
      return res.status(400).json({ error: "Category Name cannot be empty" });
    }
    const existingCat = await Category.findByPk(categoryId);
    if (!existingCat) {
      return res.status(404).json({ error: "Category not found" });
    }
    existingCat.category_name = category_name;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
      });

      if (existingCat.category_image) {
        await cloudinary.uploader.destroy(existingCat.category_image);
      }
      existingCat.category_image = result.public_id;
    }
    await existingCat.save();
    res.json({ message: "Category updated successfully" });
  } catch (error) {
    console.error("Error updating Category:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addCategory,
  getAllCategories,
  softDeleteCategory,
  updateCategory,
};
