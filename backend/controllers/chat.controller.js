const chatService = require('../services/chat.service');

class ChatController {
  async getAvailableUsers(req, res) {
    try {
      const result = await chatService.getAvailableUsers(req.user.userId);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo usuarios disponibles para chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getConversations(req, res) {
    try {
      const result = await chatService.getConversations(req.user.userId);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async saveConversation(req, res) {
    try {
      const result = await chatService.saveConversation(req.user.userId, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error guardando conversación:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async downloadConversation(req, res) {
    try {
      const conversationId = req.params.conversationId;
      await chatService.downloadConversation(req.user.userId, conversationId, res);
    } catch (error) {
      console.error('Error descargando conversación:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();