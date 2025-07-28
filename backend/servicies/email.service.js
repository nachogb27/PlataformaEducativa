const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendActivationEmail(email, name, token) {
    const activationUrl = `http://localhost:3000/api/auth/activate-account?token=${token}`;
    
    const mailOptions = {
      from: 'plataforma.educativa.proyecto@gmail.com',
      to: email,
      subject: 'Activar cuenta - Plataforma Educativa',
      html: `
        <h2>¡Bienvenido a la Plataforma Educativa!</h2>
        <p>Hola ${name},</p>
        <p>Tu cuenta ha sido creada exitosamente. Para completar el registro, necesitas activar tu cuenta.</p>
        <p>Haz clic en el siguiente botón para activar tu cuenta:</p>
        <a href="${activationUrl}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Activar Cuenta
        </a>
        <p>Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
        <p>${activationUrl}</p>
        <p>Saludos,<br>Equipo de Plataforma Educativa</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `http://localhost:8080/#/reset-password?token=${token}`;
    
    const mailOptions = {
      from: 'plataforma.educativa.proyecto@gmail.com',
      to: email,
      subject: 'Recuperación de contraseña - Plataforma Educativa',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado restablecer tu contraseña en la Plataforma Educativa.</p>
        <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
        <a href="${resetUrl}" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Restablecer Contraseña
        </a>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <p>Saludos,<br>Equipo de Plataforma Educativa</p>
      `
    };

    return await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();