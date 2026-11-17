import nodemailer from "nodemailer";
import config from "../config/config.js";
import ApiError from "../utils/apiError.js";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2', 
        user: config.GOOGLE_USER,
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        refreshToken: config.GOOGLE_REFRESH_TOKEN
    }
})

// Callback approach
transporter.verify((error, success) => {
  if (error) {
    console.error('Verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Authentication Service" <${config.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ApiError(502, "Verification email could not be sent. Please try again later");
  }
};

export default sendEmail