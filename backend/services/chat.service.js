const chatRepository = require('../repositories/chat.repository');
const userRepository = require('../repositories/user.repository');
const relationRepository = require('../repositories/relation.repository');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs').promises;
const path = require('path');

class ChatService {
  async getAvailableUsers(userId) {
    try {
      const user = await userRepository.findById(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      let availableUsers = [];

      if (user.roleData.role_name === 'student') {
        const relations = await relationRepository.findTeachersByStudent(userId);

        availableUsers = relations.map(relation => ({
          userId: relation.teacher.id,
          name: relation.teacher.name,
          surnames: relation.teacher.surnames,
          email: relation.teacher.email,
          username: relation.teacher.username || relation.teacher.email,
          role: 'teacher',
          avatar: this.buildAvatarUrl(relation.teacher.avatar)
        }));

      } else if (user.roleData.role_name === 'teacher') {
        const relations = await relationRepository.findStudentsByTeacher(userId);

        const uniqueStudents = new Map();
        relations.forEach(relation => {
          uniqueStudents.set(relation.student.id, {
            userId: relation.student.id,
            name: relation.student.name,
            surnames: relation.student.surnames,
            email: relation.student.email,
            username: relation.student.username || relation.student.email,
            role: 'student',
            avatar: this.buildAvatarUrl(relation.student.avatar)
          });
        });

        availableUsers = Array.from(uniqueStudents.values());
      }

      console.log(`✅ Usuarios disponibles para ${user.roleData.role_name}:`, availableUsers.length);
      return availableUsers;

    } catch (error) {
      console.error('❌ Error obteniendo usuarios disponibles:', error);
      throw error;
    }
  }

  async getConversations(userId) {
    try {
      const conversations = await chatRepository.findConversationsByUserId(userId);

      console.log(`📋 ✅ Conversaciones encontradas para usuario ${userId}: ${conversations.length}`);
      
      return conversations;
    } catch (error) {
      console.error('❌ Error obteniendo conversaciones:', error);
      throw error;
    }
  }

  async saveConversation(userId, data) {
    try {
      const { participantId, messages = [] } = data;

      const currentUser = await userRepository.findById(userId);
      const otherUser = await userRepository.findById(participantId);

      if (!currentUser || !otherUser) {
        throw new Error('Usuario no encontrado');
      }

      let conversation = await chatRepository.findConversationBetween(userId, participantId);
      if (!conversation) {
        conversation = await chatRepository.createConversation([
          {
            userId: currentUser.id,
            username: currentUser.username,
            role: currentUser.roleData.role_name,
            name: `${currentUser.name} ${currentUser.surnames}`
          },
          {
            userId: otherUser.id,
            username: otherUser.username,
            role: otherUser.roleData.role_name,
            name: `${otherUser.name} ${otherUser.surnames}`
          }
        ]);
      }

      let newMessagesCount = 0;
      let duplicateCount = 0;

      if (messages.length > 0) {
        const existingMessages = await chatRepository.findExistingMessages(userId, participantId);
        const existingMessageIds = new Set(existingMessages.map(m => m.messageId));
        const existingTimestamps = new Set(existingMessages.map(m => m.timestamp.getTime()));

        for (const msg of messages) {
          try {
            const messageId = msg.messageId || `msg_${msg.from}_${msg.to}_${new Date(msg.timestamp).getTime()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date(msg.timestamp);
            
            if (existingMessageIds.has(messageId) || existingTimestamps.has(timestamp.getTime())) {
              duplicateCount++;
              continue;
            }
            
            const messageData = {
              messageId: messageId,
              content: msg.text || msg.content,
              timestamp: timestamp,
              sender: {
                userId: msg.from,
                username: msg.from === userId ? currentUser.username : otherUser.username,
                role: msg.from === userId ? currentUser.roleData.role_name : otherUser.roleData.role_name,
                name: msg.from === userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
              },
              receiver: {
                userId: msg.to,
                username: msg.to === userId ? currentUser.username : otherUser.username,
                role: msg.to === userId ? currentUser.roleData.role_name : otherUser.roleData.role_name,
                name: msg.to === userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
              }
            };

            await chatRepository.saveMessage(messageData);
            newMessagesCount++;
            
            existingMessageIds.add(messageId);
            existingTimestamps.add(timestamp.getTime());
            
          } catch (error) {
            if (error.code === 11000) { 
              duplicateCount++;
            } else {
              throw error;
            }
          }
        }

        if (newMessagesCount > 0) {
          const lastMessage = messages[messages.length - 1];
          await chatRepository.updateLastActivity(
            conversation._id,
            lastMessage.text || lastMessage.content,
            new Date(lastMessage.timestamp),
            lastMessage.from === userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
          );
        }

        console.log(`💾 ✅ Guardado: ${newMessagesCount} nuevos, ${duplicateCount} duplicados ignorados`);
      }

      return { 
        message: `Conversación actualizada: ${newMessagesCount} mensajes nuevos guardados`,
        conversationId: conversation._id,
        newMessages: newMessagesCount,
        duplicatesIgnored: duplicateCount
      };

    } catch (error) {
      console.error('❌ Error guardando conversación:', error);
      throw error;
    }
  }

  async downloadConversation(userId, conversationId, res) {
    try {
      const conversation = await chatRepository.findConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }

      const isParticipant = conversation.participants.some(p => p.userId === userId);
      if (!isParticipant) {
        throw new Error('No tienes acceso a esta conversación');
      }

      const participantIds = conversation.participants.map(p => p.userId);
      const messages = await chatRepository.findMessagesBetween(participantIds[0], participantIds[1]);

      if (messages.length === 0) {
        throw new Error('No hay mensajes en esta conversación');
      }

      const downloadsDir = './downloads';
      if (!require('fs').existsSync(downloadsDir)) {
        require('fs').mkdirSync(downloadsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const participantName = conversation.participants
        .find(p => p.userId !== userId)?.name || 'Unknown';
      const filename = `chat_${participantName.replace(/\s+/g, '_')}_${timestamp}.csv`;
      const filepath = require('path').join(downloadsDir, filename);

      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'timestamp', title: 'Fecha y Hora' },
          { id: 'senderName', title: 'Remitente' },
          { id: 'senderRole', title: 'Rol Remitente' },
          { id: 'receiverName', title: 'Destinatario' },
          { id: 'receiverRole', title: 'Rol Destinatario' },
          { id: 'content', title: 'Mensaje' }
        ]
      });

      const csvData = messages.map(msg => ({
        timestamp: new Date(msg.timestamp).toLocaleString('es-ES'),
        senderName: msg.sender.name,
        senderRole: msg.sender.role === 'teacher' ? 'Profesor' : 'Estudiante',
        receiverName: msg.receiver.name,
        receiverRole: msg.receiver.role === 'teacher' ? 'Profesor' : 'Estudiante',
        content: msg.content
      }));

      await csvWriter.writeRecords(csvData);

      console.log(`📥 ✅ Archivo CSV creado: ${filename} con ${csvData.length} mensajes`);

      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error enviando archivo:', err);
          res.status(500).json({ error: 'Error enviando archivo' });
        }
        
        setTimeout(() => {
          require('fs').unlink(filepath, (cleanupError) => {
            if (cleanupError) {
              console.error('Error eliminando archivo temporal:', cleanupError);
            } else {
              console.log(`🗑️ Archivo temporal eliminado: ${filename}`);
            }
          });
        }, 60000); 
      });

    } catch (error) {
      console.error('❌ Error descargando conversación:', error);
      throw error;
    }
  }

  buildAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    return `http://localhost:3000/uploads/avatars/${avatarPath}`;
  }
}

module.exports = new ChatService();