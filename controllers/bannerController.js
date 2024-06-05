const { Banner } = require("../models");
const cloudinary = require("../config/cloudinaryConfig");
const fs = require("fs");

const createBanner = async (req, res) => {
  try {
    const { title } = req.body;

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
    });

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
    const { title } = req.body;

    const banner = await Banner.findByPk(banner_id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    banner.title = title;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "banners",
      });
      banner.image_url = result.public_id;
    }

    await banner.update({ title });
    res
      .status(200)
      .json({ message: "Banner Updated Successfully ", data: banner });
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

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll();
    if (banners.length === 0) {
      return res.status(404).json({ message: "No banners found" });
    }

    banners.forEach((banner) => {
      if (banner.image_url) {
        banner.imageURL = `https://res.cloudinary.com/dyjgvi4ma/image/upload/banners/${banner.image_url}`;
      }
    });

    res.status(200).json({ message: "Banners Fetched Successfully ", data: banners });
  } catch (error) {
    console.error("Error getting banners:", error);
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
    banners.forEach((banner) => {
      if (banner.image_url) {
        banner.imageURL = `https://res.cloudinary.com/dyjgvi4ma/image/upload/banners/${banner.image_url}`;
      }
    });
    res.status(200).json({ message: "Banners Fetched Successfully ", data: banners });
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
