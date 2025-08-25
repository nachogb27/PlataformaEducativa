const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/available-users', ChatController.getAvailableUsers);

router.get('/conversations', ChatController.getConversations);

router.post('/save-conversation', ChatController.saveConversation);

router.get('/download/:conversationId', ChatController.downloadConversation);

module.exports = router;