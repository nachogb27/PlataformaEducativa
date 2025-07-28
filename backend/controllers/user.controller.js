const userService = require('../services/user.service');

class UserController {
  async getProfile(req, res) {
    try {
      const profile = await userService.getProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(404).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await userService.updateProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async updateAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se envió ningún archivo' });
      }

      const result = await userService.updateAvatar(req.user.id, req.file);
      res.json(result);
    } catch (error) {
      console.error('Error actualizando avatar:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async deleteAvatar(req, res) {
    try {
      const result = await userService.deleteAvatar(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Error eliminando avatar:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();