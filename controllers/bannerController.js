const { Banner } = require("../models");
const { Op } = require("sequelize");
const cloudinary = require("../config/cloudinaryConfig");

// Create a new banner
const createBanner = async (req, res) => {
  try {
    const { title, start_date, end_date } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const imageUrl = await cloudinary.uploader.upload(req.file, {
      folder: "banners",
    });

    const banner = await Banner.create({
      image_url: imageUrl,
      title,
      start_date,
      end_date,
    });

    res.status(200).json({ message: "Banner Added Successfully ", data: banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Update a banner
const updateBanner = async (req, res) => {
  try {
    const { banner_id } = req.params;
    const { title, start_date, end_date } = req.body;

    const banner = await Banner.findByPk(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    if (req.file) {
      const imageUrl = await cloudinary.uploader.upload(req.file, {
        folder: "banners",
      });
      banner.image_url = imageUrl;
    }

    await banner.update({ title, start_date, end_date });
    res.status(200).json({ message: "Banner Updated Successfully ", data: banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete a banner (soft delete)
const deleteBanner = async (req, res) => {
  try {
    const { banner_id } = req.params;
    const banner = await Banner.findByPk(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    await banner.destroy();
    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();
    res.json(banners);
  } catch (error) {
    console.error("Error getting banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get active banners
const getActiveBanners = async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    const banners = await Banner.findAll({
      where: {
        is_active: true,
        start_date: { [Op.lte]: currentDate },
        end_date: { [Op.gte]: currentDate },
      },
    });
    res.json(banners);
  } catch (error) {
    console.error("Error getting active banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getAllBanners,
  getActiveBanners,
};
