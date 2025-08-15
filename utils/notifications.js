const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send email function
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Counselor App</h2>
          <p style="font-size: 16px; color: #666;">${text}</p>
          <hr style="border: none; height: 1px; background-color: #eee;">
          <p style="font-size: 12px; color: #999;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send SMS function
const sendSMS = async (to, message) => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('SMS would be sent to:', to, 'Message:', message);
      return { sid: 'mock-sms-id' };
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });

    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};

// Send OTP email template
const sendOTPEmail = async (to, otp, purpose = 'verification') => {
  const subjects = {
    verification: 'Email Verification Code',
    password_reset: 'Password Reset Code',
    login: 'Login Verification Code'
  };

  const messages = {
    verification: `Your email verification code is: ${otp}`,
    password_reset: `Your password reset code is: ${otp}`,
    login: `Your login verification code is: ${otp}`
  };

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4A90E2;">Counselor App</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">${subjects[purpose]}</h2>
        <p style="font-size: 16px; color: #666; margin-bottom: 20px;">
          ${messages[purpose]}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #4A90E2; padding: 15px 30px; border: 2px solid #4A90E2; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #999;">
          This code expires in 5 minutes. If you didn't request this code, please ignore this email.
        </p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subjects[purpose], messages[purpose], htmlTemplate);
};

// Send welcome email
const sendWelcomeEmail = async (to, firstName) => {
  const subject = 'Welcome to Counselor App!';
  const text = `Hello ${firstName}, welcome to Counselor App! We're excited to have you on board.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4A90E2;">Welcome to Counselor App!</h1>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${firstName}!</h2>
        <p style="font-size: 16px; color: #666;">
          We're excited to have you join our community. Counselor App connects you with professional counselors 
          for career guidance and mental health support.
        </p>
        
        <h3 style="color: #333;">What you can do:</h3>
        <ul style="color: #666; font-size: 16px;">
          <li>Browse and connect with certified counselors</li>
          <li>Book sessions for career or mental health counseling</li>
          <li>Access resources and tools for personal growth</li>
          <li>Track your progress and goals</li>
        </ul>
        
        <p style="font-size: 16px; color: #666;">
          Get started by verifying your email address and exploring our counselor profiles.
        </p>
      </div>
      
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999;">
          Need help? Contact our support team anytime.
        </p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendSMS,
  sendOTPEmail,
  sendWelcomeEmail
};