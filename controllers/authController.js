const { generateToken, jwtMiddleware } = require("../middleware/jwtMiddleware");
const { Vendor, User, Admin } = require("../models");

const bcrypt = require("bcryptjs");

const firebase = require("firebase-admin");

var serviceAccount = require("../config/jewellery-multistore-operation-firebase-adminsdk");
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});

const userLogin = async (req, res) => {
  const idToken = req.body.idToken;
  try {
    const decodedToken = await firebase.auth().verifyIdToken(idToken);
    let phoneNumber = decodedToken.phone_number;

    if (phoneNumber.startsWith("+91")) {
      phoneNumber = phoneNumber.substring(3);
    }

    const user = await User.findOne({
      where: { phone_no: phoneNumber },
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found with the provided phone number" });
    }
    const authority = "user";
    const token = generateToken(
      user.user_id,
      user.first_name,
      user.email,
      authority
    );

    res
      .status(200)
      .json({ message: "Phone number verified successfully", token, user });
  } catch (error) {
    console.error("Error verifying ID token:", error);
    res.status(401).json({ error: "Invalid ID token" });
  }
};

const vendorLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const vendor = await Vendor.findOne({ where: { email } });

    if (vendor) {
      if (vendor.active_status !== "active") {
        return res
          .status(403)
          .json({ message: "Vendor account is not active" });
      }

      if (
        vendor.active_status === "pending" ||
        vendor.active_status === "inactive"
      ) {
        return res
          .status(403)
          .json({ message: "Vendor account is pending or inactive" });
      }
      const passwordMatch = await bcrypt.compare(password, vendor.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      const authority = "vendor";
      const token = generateToken(
        vendor.vendor_id,
        vendor.first_name,
        vendor.email,
        authority
      );

      res.status(200).json({ message: "Login successful", vendor, token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
      const authority = "admin";
      const token = generateToken(
        admin.admin_id,
        admin.first_name,
        admin.email,
        authority
      );
      res.status(200).json({ message: "Login successful", admin, token });
    } else {
      res.status(401).json({ message: "Invalid Email" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userRegister = async (req, res) => {
  const { first_name, last_name, email, phone_no } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    const newUser = await User.create({
      first_name: first_name,
      last_name: last_name,
      email,
      phone_no: phone_no,
    });

    const authority = "user";
    const token = generateToken(
      newUser.user_id,
      newUser.first_name,
      newUser.email,
      authority
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser, token });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.decodedToken.id;

    const user = await User.findOne({ where: { user_id: userId } });

    if (user) {
      res.status(200).json({
        message: "User profile retrieved successfully",
        user: user,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateUser = async (req, res) => {
  const userId = req.decodedToken.id;
  const { first_name, last_name, email,  } = req.body;
  try {
    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      email: email || user.email,
    });
    res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  userLogin,
  vendorLogin,
  adminLogin,
  userRegister,
  getUserProfile,
  updateUser
};
