const { Conversation, Message } = require('../models/chat.model');

class ChatRepository {
  async findConversationsByUserId(userId) {
    return await Conversation.find({
      'participants.userId': userId,
      isActive: true
    }).sort({ updatedAt: -1 });
  }

  async findConversationBetween(userId1, userId2) {
    return await Conversation.findOne({
      'participants.userId': { $all: [userId1, userId2] }
    });
  }

  async createConversation(participants) {
    const conversation = new Conversation({ participants });
    return await conversation.save();
  }

  async updateLastActivity(conversationId, content, timestamp, senderName) {
    return await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { content, timestamp, sender: { name: senderName } },
      updatedAt: new Date()
    });
  }

  async findMessagesBetween(userId1, userId2) {
    return await Message.find({
      $or: [
        { 'sender.userId': userId1, 'receiver.userId': userId2 },
        { 'sender.userId': userId2, 'receiver.userId': userId1 }
      ]
    }).sort({ timestamp: 1 });
  }

  async findExistingMessages(userId1, userId2) {
    return await Message.find({
      $or: [
        { 'sender.userId': userId1, 'receiver.userId': userId2 },
        { 'sender.userId': userId2, 'receiver.userId': userId1 }
      ]
    }).select('messageId timestamp');
  }

  async saveMessage(messageData) {
    const message = new Message(messageData);
    return await message.save();
  }
}

module.exports = new ChatRepository();
