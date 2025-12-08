/**
 * Email Service Configuration
 * Uses Brevo (formerly Sendinblue) for email delivery
 */

const brevo = require('@getbrevo/brevo');
const logger = require('./logger');

// Initialize Brevo API client
let apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

/**
 * Generic send email function
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'noreply@example.com';
    const fromName = process.env.EMAIL_FROM_NAME || 'Auth System';

    logger.info(`Attempting to send email to ${to} from ${fromName} <${fromEmail}>`);

    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: fromName,
      email: fromEmail
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    if (text) {
      sendSmtpEmail.textContent = text;
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    logger.info(`✅ Email sent successfully → ${to} | Message ID: ${data.messageId}`);
    return data;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    if (error.response) {
      logger.error(`Brevo API error: ${JSON.stringify(error.response.body)}`);
    }
    throw error;
  }
};

/**
 * Send Email Verification OTP
 */
const sendVerificationEmail = async (email, otp, name = 'User') => {
  const subject = 'Verify Your Email Address';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; text-align: center; color: #444; }
        .otp { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; background: #f8f9ff; padding: 20px; border-radius: 10px; margin: 25px 0; display: inline-block; }
        .footer { background: #f8f9fc; padding: 20px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>You're almost there. Use the OTP below to verify your email address:</p>
          <div class="otp">${otp}</div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p>If you didn't sign up, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MERN Auth System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hello ${name}!\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't sign up, you can safely ignore this email.`;

  return await sendEmail({ to: email, subject, html, text });
};

/**
 * Send Password Reset OTP
 */
const sendPasswordResetEmail = async (email, otp, name = 'User') => {
  const subject = 'Password Reset Request';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; text-align: center; color: #444; }
        .otp { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; background: #fff0f5; padding: 20px; border-radius: 10px; margin: 25px 0; display: inline-block; }
        .warning { background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; text-align: left; }
        .footer { background: #f8f9fc; padding: 20px; text-align: center; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hi ${name},</h2>
          <p>We received a request to reset your password. Use the OTP below:</p>
          <div class="otp">${otp}</div>
          <div class="warning">
            <strong>Didn't request this?</strong> No action is needed — your password remains unchanged.
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} MERN Auth System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `Hi ${name},\n\nYour password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, no action is needed.`;

  return await sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};