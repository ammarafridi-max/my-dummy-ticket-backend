require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, templateData) => {
  const {
    customerName,
    ticketType,
    departureCity,
    arrivalCity,
    departureDate,
    currency,
    amount,
  } = templateData;

  const path = "http://localhost:3001/uploads/logo.png";

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 20px auto;
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
      .header img {
        max-width: 150px;
        height: auto;
      }
      .content {
        margin: 20px 0;
      }
      .content h1 {
        color: #333;
      }
      .content p {
        line-height: 1.6;
        margin: 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #777;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        color: #fff;
        background-color: #28a745;
        text-decoration: none;
        border-radius: 5px;
      }
      .button:hover {
        background-color: #218838;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
      <p>Hi! from Dummy Ticket</p>
      </div>
      <div class="content">
        <h1>Thank You for Your Payment!</h1>
        <p>Dear ${customerName},</p>
        <p>We are pleased to inform you that your payment has been successfully processed. Below are the details of your ticket:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Ticket Type:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${ticketType}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>From:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${departureCity}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>To:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${arrivalCity}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Departure Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${departureDate}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Price:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${currency} ${amount}</td>
          </tr>
         
        </table>
        <p>Your ticket is now confirmed. If you have any questions or need further assistance, please do not hesitate to contact us.</p>
        <p>Thank you for choosing our service!</p>
      </div>
      <div class="footer">
      </div>
    </div>
  </body>
  </html>
  `;

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const res = await transporter.sendMail(mailOptions);
    return res;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
};

module.exports = {
  sendEmail,
};
