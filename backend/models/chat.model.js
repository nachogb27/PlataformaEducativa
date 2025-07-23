// models/chatModels.js
const mongoose = require('mongoose');

// Esquema para mensajes individuales
const MessageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true  // Garantiza que no haya duplicados
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sender: {
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  receiver: {
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  }
});

// Esquema para conversaciones/chats
const ConversationSchema = new mongoose.Schema({
  participants: [{
    userId: {
      type: Number,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['teacher', 'student'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  }],
  subject: {
    type: String,
    default: 'Chat General'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    content: String,
    timestamp: Date,
    senderName: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
ConversationSchema.index({ 'participants.userId': 1 });
ConversationSchema.index({ createdAt: -1 });
ConversationSchema.index({ updatedAt: -1 });

MessageSchema.index({ 'sender.userId': 1, 'receiver.userId': 1 });
MessageSchema.index({ timestamp: -1 });

// Método para encontrar conversación entre dos usuarios
ConversationSchema.statics.findConversationBetween = async function(userId1, userId2) {
  return await this.findOne({
    $and: [
      { 'participants.userId': userId1 },
      { 'participants.userId': userId2 }
    ]
  }).sort({ updatedAt: -1 });
};

// Método para actualizar última actividad
ConversationSchema.methods.updateLastActivity = async function(messageData) {
  this.lastMessage = {
    content: messageData.content,
    timestamp: messageData.timestamp,
    senderName: messageData.sender.name
  };
  this.updatedAt = new Date();
  this.messageCount += 1;
  await this.save();
};

const Message = mongoose.model('Message', MessageSchema);
const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = {
  Message,
  Conversation
};