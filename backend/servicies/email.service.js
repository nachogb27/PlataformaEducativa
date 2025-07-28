const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendMail(mailOptions) {
    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
