
// server/services/email.service.js
const nodemailer = require('nodemailer');

/**
 * Email service for sending emails
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || 'your_mailtrap_user',
        pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
      }
    });
  }

  /**
   * Send an email
   * @param {Object} emailData - Email data object
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.body - Email body (HTML)
   * @param {string} [emailData.from] - Sender email
   * @returns {Promise} - Nodemailer info object
   */
  async sendEmail(emailData) {
    const { to, subject, body, from } = emailData;
    
    try {
      const info = await this.transporter.sendMail({
        from: from || process.env.EMAIL_FROM || '"Email Marketing App" <noreply@emailmarketing.com>',
        to,
        subject,
        html: body
      });
      
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
