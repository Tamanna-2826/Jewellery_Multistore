const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary"); // Add this import
const cloudinary = require("../config/cloudinaryConfig");


const vendorController = require("../controllers/vendorController");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Vendor_Data/vendors",
    format: async (req, file) => "jpg", // supports promises as well
    public_id: (req, file) => Date.now() + "-" + file.originalname,
  },
});

const upload = multer({ storage: storage });

router.post("/register",upload.fields([{ name: "aadhar_copy", maxCount: 1 },{ name: "pan_copy", maxCount: 1 },{ name: "add_prof", maxCount: 1 },]),vendorController.vendorRegistration);
router.get('/getKYCDetails/:vendor_id', vendorController.getVendorDetails);
router.get("/pending", vendorController.getPendingVendors);
router.put("/activate/:vendor_id", vendorController.vendorActivation);
router.get("/active", vendorController.getactiveVendors);
router.put("/deactivate/:vendor_id", vendorController.vendorDeactivation);
router.get("/deactive", vendorController.getdeactiveVendors);
router.put("/update-password/:vendor_id",vendorController.updateVendorPassword);

module.exports = router;
