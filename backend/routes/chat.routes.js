const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

// Obtener usuarios disponibles para chat
router.get('/available-users', ChatController.getAvailableUsers);

// ...agrega aquí el resto de endpoints de chat

module.exports = router;
