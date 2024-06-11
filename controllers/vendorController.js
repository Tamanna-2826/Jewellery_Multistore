const { Vendor, User, Product, VendorKYC } = require("../models");
const { sendEmail } = require("../helpers/emailHelper");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinaryConfig");

const generateRandomPassword = () => {
  const randomBytes = crypto.randomBytes(5);
  const password = randomBytes.toString("hex");
  return password;
};


const vendorRegistration = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      country_code,
      phone_no,
      gstno,
      city_id,
      state_id,
      address,
      company_name,
      business_reg_no,
      aadhar_no,
      pan_no,
      bank_acc_no,
      bank_name,
      ifsc_code,
    } = req.body;

    const existingEmailUser = await User.findOne({ where: { email } });
    const existingPhoneUser = await User.findOne({ where: { phone_no } });

    if (existingEmailUser) {
      return res
        .status(400)
        .json({ message: "Email already exists as a user" });
    }

    if (existingPhoneUser) {
      return res
        .status(400)
        .json({ message: "Phone number already exists as a user" });
    }

    const existingEmailVendor = await Vendor.findOne({ where: { email } });
    const existingPhoneVendor = await Vendor.findOne({ where: { phone_no } });

    if (existingEmailVendor) {
      return res
        .status(400)
        .json({ message: "Email already exists as a vendor" });
    }

    if (existingPhoneVendor) {
      return res
        .status(400)
        .json({ message: "Phone number already exists as a vendor" });
    }
    const newVendor = await Vendor.create({
      first_name,
      last_name,
      email,
      password,
      country_code,
      phone_no,
      gstno,
      city_id,
      state_id,
      address,
      company_name,
      active_status: "pending",
    });

     // Handle file uploads and store public IDs
     let aadharCopyPublicId = null;
     if (req.files && req.files.aadhar_copy) {
       aadharCopyPublicId = req.files.aadhar_copy[0].path;
     }
 
     let panCopyPublicId = null;
     if (req.files && req.files.pan_copy) {
       panCopyPublicId = req.files.pan_copy[0].path;
     }
 
     let addProfPublicId = null;
     if (req.files && req.files.add_prof) {
       addProfPublicId = req.files.add_prof[0].path;
     }
 

    const newVendorKYC = await VendorKYC.create({
      vendor_id: newVendor.vendor_id,
      business_reg_no,
      aadhar_no,
      aadhar_copy: aadharCopyPublicId,
      pan_no,
      pan_copy: panCopyPublicId,
      add_prof: addProfPublicId,
      bank_acc_no,
      bank_name,
      ifsc_code,
    });

    res.status(200).json({ message: "Vendor registered successfully", newVendor, newVendorKYC,
      });
  } catch (error) {
    console.error("Error registering vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getVendorDetails = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const vendorDetails = await Vendor.findOne({
      where: { vendor_id },
      include: [
        {
          model: VendorKYC,
          as: 'kycDetails',
        },
      ],
    });

    if (!vendorDetails) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json({ vendor: vendorDetails });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const vendorActivation = async (req, res) => {
  const { vendor_id } = req.params;

  try {
    const vendor = await Vendor.findOne({
      where: { vendor_id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const tempPassword = generateRandomPassword(2);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await vendor.update({
      active_status: "active",
      password: hashedPassword,
    });

    const htmlContent = `
      <html>
      <head>
          <style>
             body {
            font-family: Arial, sans-serif;
            padding: 0;
            margin: 0;
            background-color: #f2e9e9;
           }
        
        .container {
            max-width: 600px;
            padding: 20px;
            margin: 40px auto;
            border-radius: 10px;
            background-color: white;
            /box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);/
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
            text-align: center;
        }
        
        h1 {
            text-align: center;
            color: #832729;
          }

        .content {
            padding: 20px;
            color: #333;
        }
        
        .footer {
            color: #832729;
            text-align: center;
            padding: 20px;
            background-color: #f2e9e9;
            border-radius: 0 0 10px 10px;
        }
        
        .header img {
            width: 100%;
            max-width: 350px;
            height: auto;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            background-color: #f2e9e9;
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
         p {         
           margin: 10px 0;
        }
          </style>
      </head>
      
      <body>
      <div class="container">
          <div class="header">
              <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" height="300px" width="350px"></h2>
              <h1 style="margin-top: 0;">Congratulations ${vendor.first_name} !</h1>
          </div>
          <div class="content">
              <p>
                  Dear ${vendor.first_name},
              </p>
              <p>
                  Your account has been successfully verified and activated. You can now log in to your account and start using
                  our services.
                  <p>
                 Email Id : ${vendor.email},
                 </p>
                 <p>
                 Password : ${tempPassword}
                 </p>
                 You can change your password by visiting your dashboard.
              </p>
              <p>
                  Login Link : <a href="http://192.168.2.102:3000/sign-in"> Click here </a>
              </p>
          </div>
          <div class="footer">
            <p>If you have any questions, please contact our support team at support@nishkar.com</p>
          </div>
      </div>
      </body>
      </html>`;

    sendEmail(vendor.email, "Account Activation", htmlContent);
    res.json({ success: true, message: "Vendor status updated to active" });
  } catch (error) {
    console.error("Error activating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const vendorDeactivation = async (req, res) => {
  const { vendor_id } = req.params;
  try {
    const vendor = await Vendor.findOne({
      where: { vendor_id },
    });

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    await Product.destroy({
      where: { vendor_id },
    });

    await vendor.update({ active_status: "deactive" });

    const htmlContent = `
    <html>
    <head>
        <style>
            body {
            font-family: Arial, sans-serif;
            padding: 0;
            margin: 0;
            background-color: #f2e9e9;
           }
        
        .container {
            max-width: 600px;
            padding: 20px;
            margin: 40px auto;
            border-radius: 10px;
            background-color: white;
            /box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);/
        }
        
        .header {
            color: #832729;
            padding: 20px;
            border-bottom: 2px solid #f2e9e9;
            text-align: center;
        }
        
        h1 {
            text-align: center;
            color: #832729;
          }

        .content {
            padding: 20px;
            color: #333;
        }
        
        .footer {
            color: #832729;
            text-align: center;
            padding: 20px;
            background-color: #f2e9e9;
            border-radius: 0 0 10px 10px;
        }
        
        .header img {
            width: 100%;
            max-width: 350px;
            height: auto;
        }
        
        ul {
            list-style-type: none;
            padding: 0;
        }
        
        ul li {
            background-color: #f2e9e9;
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
        }
         p {         
           margin: 10px 0;
        }
        </style>
    </head>
    
    <body>
    <div class="container">
        <div class="header">
            <h2><img src="https://res.cloudinary.com/dyjgvi4ma/image/upload/v1717778172/i0wmv4lts0wkopgpovsj.png" height="300px" width="350px"></h2>
            <h1 style="margin-top: 0;"> Account Deactivation on Nishkar </h1>
        </div>
        <div class="content">
            <p>
                Dear ${vendor.first_name},
            </p>
            <p>
            We regret to inform you that your vendor account on Nishkar has been deactivated by our administrative team. This action has been taken due to policy violation.
            Please note that during this deactivation period, you will not be able to access your vendor dashboard or receive new orders from customers.<br>
            <br>
            If you believe this deactivation was made in error or have any concerns, please reach out to us at admin@nishkar.com , and we will be happy to review your case.
           <br><br>
            Thank you for your understanding.
            </p>
            <p>
            Best regards,<br>
            Team Nishkar
            </p>

        </div>
        <div class="footer">
            <p>If you have any questions, please contact our support team at support@nishkar.com </p>
        </div>
    </div>
    </body>
    </html>`;

    sendEmail(
      vendor.email,
      "Account Deactivation on sarvadhi Solutions",
      htmlContent
    );

    res.json({ success: true, message: "Vendor deactivated successfully" });
  } catch (error) {
    console.error("Error deactivating vendor:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getPendingVendors = async (req, res) => {
  try {
    const pendingVendors = await Vendor.findAll({
      where: {
        active_status: "pending",
      },
    });

    res.status(200).json({ success: true, pendingVendors });
  } catch (error) {
    console.error("Error fetching pending vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getactiveVendors = async (req, res) => {
  try {
    const activeVendors = await Vendor.findAll({
      where: {
        active_status: "active",
      },
    });

    res.status(200).json({ success: true, activeVendors });
  } catch (error) {
    console.error("Error fetching pending vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getdeactiveVendors = async (req, res) => {
  try {
    const deactiveVendors = await Vendor.findAll({
      where: {
        active_status: "deactive",
      },
    });

    res.status(200).json({ success: true, deactiveVendors });
  } catch (error) {
    console.error("Error fetching pending vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateVendorPassword = async (req, res) => {
  const { vendor_id } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const vendor = await Vendor.findByPk(vendor_id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, vendor.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await vendor.update({ password: hashedPassword });

    res.json({
      success: true,
      message: "Vendor password updated successfully",
    });
  } catch (error) {
    console.error("Error updating vendor password:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  vendorRegistration,
  vendorActivation,
  getPendingVendors,
  getactiveVendors,
  vendorDeactivation,
  getdeactiveVendors,
  updateVendorPassword,
  getVendorDetails
};
