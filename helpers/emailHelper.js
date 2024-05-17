const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "projectsarvadhi@gmail.com",
        pass: "aabf fktz tzwi rmmg",
      },
  });

// Reusable function to send email
function sendEmail(to, subject, htmlContent) {
    const mailOptions = {
      from: "projectsarvadhi@gmail.com",
      to,
      subject,
      html: htmlContent,
    };
  
    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  }
  
  module.exports = { sendEmail };