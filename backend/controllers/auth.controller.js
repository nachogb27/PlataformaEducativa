const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      res.json(result);
    } catch (error) {
      console.error('Error en register:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async activateAccount(req, res) {
    try {
      const { token } = req.query;
      const result = await authService.activateAccount(token);
      res.redirect('http://localhost:8080/login?activated=true');
    } catch (error) {
      console.error('Error en activación:', error);
      res.status(403).send('Token inválido o cuenta ya activada.');
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      console.error('Error en forgot-password:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword, confirmPassword);
      res.json(result);
    } catch (error) {
      console.error('Error en reset-password:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async logout(req, res) {
    try {
      const result = await authService.logout(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({ error: 'Error al cerrar sesión' });
    }
  }
}

module.exports = new AuthController();