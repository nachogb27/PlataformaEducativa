const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas de chat requieren autenticación
router.use(authenticateToken);

// Obtener usuarios disponibles para chat
router.get('/available-users', ChatController.getAvailableUsers);

// Obtener conversaciones del usuario
router.get('/conversations', ChatController.getConversations);

// 🔧 RUTA FALTANTE: Guardar conversación
router.post('/save-conversation', ChatController.saveConversation);

// Descargar conversación en CSV
router.get('/download/:conversationId', ChatController.downloadConversation);

module.exports = router;