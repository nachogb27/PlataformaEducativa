const chatService = require('../services/chat.service');

class ChatController {
  async getAvailableUsers(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await chatService.getAvailableUsers(token);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo usuarios disponibles para chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getConversations(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await chatService.getConversations(token);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo conversaciones:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async saveConversation(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await chatService.saveConversation(token, req.body);
      res.json(result);
    } catch (error) {
      console.error('Error guardando conversación:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async downloadConversation(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const conversationId = req.params.conversationId;
      await chatService.downloadConversation(token, conversationId, res);
    } catch (error) {
      console.error('Error descargando conversación:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new ChatController();
