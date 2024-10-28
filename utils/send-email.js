require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

// Function to send an email
const sendEmail = async (to, subject, htmlContent) => {
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

// Function to generate email templates
const generateEmailTemplate = (templateType, templateData) => {
  switch (templateType) {
    case "adminFormSubmission":
      return adminFormSubmissionTemplate(templateData);
    case "adminPaymentNotification":
      return adminPaymentNotificationTemplate(templateData);
    case "customerPaymentConfirmation":
      return customerPaymentConfirmationTemplate(templateData);
    default:
      return "";
  }
};

// Template for admin form submission email
const adminFormSubmissionTemplate = ({
  type,
  submittedOn,
  ticketCount,
  passengers,
  number,
  email,
  from,
  to,
  departureDate,
  returnDate,
  message,
}) => {
  // Create a list of passengers
  const passengerList = passengers
    .map(
      (passenger) => `
      <p>
        <strong>${passenger.type}</strong> ${passenger.title}${passenger.firstName}${passenger.lastName}<br>
      </p>`
    )
    .join("");

  return `
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Form Submission</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      color: #333;
      background-color: #f4f9f9; /* Soft background for better readability */
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      padding: 25px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-top: 10px solid #20b2aa; /* Light sea green theme accent */
    }
    h1 {
      color: #20b2aa;
      font-size: 26px;
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #20b2aa;
      padding-bottom: 10px;
    }
    p {
      line-height: 1.5;
      margin: 10px 0;
      font-size: 16px;
      color: #555; 
    }
    strong {
      color: #20b2aa; /* Themed strong elements */
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    .details-table td {
      padding: 10px;
      border: 1px solid #ddd;
      text-align: left;
    }
    .details-table th {
      background-color: #20b2aa;
      color: #ffffff;
      padding: 10px;
      text-align: left;
    }
    .footer {
      margin-top: 30px;
      font-size: 14px;
      text-align: center;
      color: #666;
    }
    .footer p {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 25px;
      font-size: 16px;
      color: #ffffff;
      background-color: #20b2aa;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      transition: background-color 0.3s ease;
    }
    .button:hover {
      background-color: #1b998b;
    }
    .icon {
      width: 50px;
      height: 50px;
      display: inline-block;
      vertical-align: middle;
      margin-right: 10px;
    }
    /* Responsive design */
    @media (max-width: 600px) {
      .container {
        padding: 20px;
      }
      h1 {
        font-size: 22px;
      }
      p, .button {
        font-size: 15px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1> New Customer Form Submission</h1>
    <p>Dear Admin,</p>
    <p>A new customer has filled out the form. Below are the details:</p>

    <!-- Details Table -->
    <table class="details-table">
      <tr>
        <th>Detail</th>
        <th>Information</th>
      </tr>
      <tr>
        <td><strong>Type:</strong></td>
        <td>
        <p>${type}</p></td>
      </tr>
      <tr>
        <td><strong>Submitted On:</strong></td>
        <td><p>${submittedOn}</p></td>
      </tr>
      <tr>
        <td><strong>Number of Tickets:</strong></td>
        <td><p>${ticketCount}</p></td>
      </tr>
      <tr>
        <td><strong>Passengers:</strong></td>
        <td><p>${passengerList}</p></td>
      </tr>
      <tr>
        <td><strong>Phone Number:</strong></td>
        <td><p>${number}</p></td>
      </tr>
      <tr>
        <td><strong>Email:</strong></td>
        <td><p>${email}</p></td>
      </tr>
      <tr>
        <td><strong>From:</strong></td>
        <td><p>${from}</p></td>
      </tr>
      <tr>
        <td><strong>To:</strong></td>
        <td><p>${to}</p></td>
      </tr>
      <tr>
        <td><strong>Departing On:</strong></td>
        <td><p>${departureDate}</p></td>
      </tr>
      ${
        returnDate
          ? `
      <tr>
        <td><strong>Returning On:</strong></td>
        <td><p>${returnDate}</p></td>
      </tr>
      `
          : ""
      }
      ${
        message
          ? `
      <tr>
        <td><strong>Message:</strong></td>
        <td><p>${message}</p></td>
      </tr>
      `
          : ""
      }
    </table>

  

    <div class="footer">
      <p>Best regards,</p>
      <p><strong>My Dummy Ticket</strong></p>
    </div>
  </div>
</body>
</html>

  
  `;
};

// Template for admin payment notification email
const adminPaymentNotificationTemplate = ({
  customerName,
  ticketType,
  departureCity,
  arrivalCity,
  departureDate,
  currency,
  amount,
}) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body>
  <div>
    <!-- Header with Icon -->
    <h1>Payment Confirmation</h1>

    <!-- Greeting Message -->
    <p>Dear Admin,</p>
    <p>We are excited to inform you that a payment has been successfully processed! Here are the details:</p>

    <!-- Payment Details -->
 
    <p>Payment Amount: ${currency} ${amount}</p>
    <p>Ticket Type: ${ticketType}</p>
    <p>Customer Email: ${customerName}</p>
    <p>From: ${departureCity}</p>
    <p>To: ${arrivalCity}</p>
    <p>Departure Date: ${departureDate}</p>

  
    <!-- Footer -->
    <p>Best regards,</p>
    <p>My Dummy Ticket</p>
  </div>
</body>
</html>

  `;
};

// Template for customer payment confirmation email
const customerPaymentConfirmationTemplate = ({
  customerName,
  ticketType,
  departureCity,
  arrivalCity,
  departureDate,
  currency,
  amount,
}) => {
  return `
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body>
  <div>
    <h1>Order Confirmation</h1>
    <p>Dear ${customerName},</p>
    <p>Your payment of ${currency} ${amount} has been successfully processed. Below are the details of your order:</p>

    <p>Ticket Type: ${ticketType}</p>
    <p>Email: ${customerName}</p>
    <p>From: ${departureCity}</p>
    <p>To: ${arrivalCity}</p>
    <p>Departing On: ${departureDate}</p>

    <p>If you have any questions, feel free to contact us at reservation@citytours.ae.</p>

    <p>Thank you for choosing us!</p>
    <p>My Dummy Ticket</p>
  </div>
</body>
</html>

  `;
};

module.exports = {
  sendEmail,
  generateEmailTemplate,
};
