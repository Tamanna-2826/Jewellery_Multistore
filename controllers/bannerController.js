const { Banner } = require("../models");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");
const path = require("path");
const createBanner = async (req, res) => {
  try {
    const { title, is_active, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }
    let bannerImageId = null;

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "banners",
    });
    bannerImageId = result.public_id;
    const banner = await Banner.create({
      image_url: bannerImageId,
      title,
      is_active,
      category,
    });

   // Delete the uploaded file from the local system
    const filePath = path.join(__dirname, "..", req.file.path);
    fs.unlinkSync(filePath);

    res
      .status(200)
      .json({ message: "Banner Added Successfully", data: banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateBanner = async (req, res) => {
  try {
    const { banner_id } = req.params;
    const { title, is_active, category } = req.body;

    const banner = await Banner.findByPk(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete existing image if a new file is uploaded
    if (req.file && banner.image_url) {
      await cloudinary.uploader.destroy(banner.image_url);
    }

    // Upload new image if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners",
      });
      banner.image_url = result.public_id;
    }

    // Update banner details
    banner.title = title;
    banner.is_active = is_active;
    banner.category = category;
    await banner.save();

    res
      .status(200)
      .json({ message: "Banner Updated Successfully", data: banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

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

// Get active banners
const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: {
        is_active: true,
      },
    });

    const bannersWithUrls = banners.map((banner) => ({
      banner_id: banner.banner_id,
      title: banner.title,
      category: banner.category,
      is_active: banner.is_active,
      image_url: banner.image_url
        ? `https://res.cloudinary.com/dyjgvi4ma/image/upload/${banner.image_url}`
        : null,
    }));

    res.status(200).json({
      message: "Banners fetched successfully",
      data: bannersWithUrls,
    });
  } catch (error) {
    console.error("Error getting active banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Banners by category
const getBannersByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    const banners = await Banner.findAll({
      where: {
        category,
        is_active: true,
      },
    });

    const bannersWithUrls = banners.map((banner) => ({
      banner_id: banner.banner_id,
      title: banner.title,
      is_active: banner.is_active,
      category: banner.category,
      image_url: banner.image_url
        ? `https://res.cloudinary.com/dyjgvi4ma/image/upload/${banner.image_url}`
        : null,
    }));

    res.status(200).json({
      message: "Banners fetched successfully",
      data: bannersWithUrls,
    });
  } catch (error) {
    console.error("Error getting active banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get all banners
const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();

    const bannersWithUrls = banners.map((banner) => ({
      banner_id: banner.banner_id,
      title: banner.title,
      category: banner.category,
      createdAt: banner.createdAt,
      is_active: banner.is_active,
      image_url: banner.image_url
        ? `https://res.cloudinary.com/dyjgvi4ma/image/upload/${banner.image_url}`
        : null,
    }));

    res.status(200).json({
      message: "Banners fetched successfully",
      data: bannersWithUrls,
    });
  } catch (error) {
    console.error("Error getting active banners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports = {
  createBanner,
  updateBanner,
  deleteBanner,
  getActiveBanners,
  getAllBanners,
  getBannersByCategory,
};
