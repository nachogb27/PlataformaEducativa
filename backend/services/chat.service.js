const jwt = require('jsonwebtoken');
const chatRepository = require('../repositories/chat.repository');
const userRepository = require('../repositories/user.repository');
const relationRepository = require('../repositories/relation.repository');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs').promises;
const path = require('path');

class ChatService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET;
  }

  // Decodificar token JWT para obtener información del usuario
  decodeToken(token) {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  async getAvailableUsers(token) {
    try {
      const decoded = this.decodeToken(token);
      const user = await userRepository.findById(decoded.userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      let availableUsers = [];

      if (user.roleData.role_name === 'student') {
        // Estudiante: mostrar sus profesores
        const relations = await relationRepository.findTeachersByStudent(decoded.userId);

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
        // Profesor: mostrar sus estudiantes
        const relations = await relationRepository.findStudentsByTeacher(decoded.userId);

        // Eliminar duplicados si un estudiante está en múltiples asignaturas
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

  async getConversations(token) {
    try {
      const decoded = this.decodeToken(token);
      
      const conversations = await chatRepository.findConversationsByUserId(decoded.userId);

      console.log(`📋 ✅ Conversaciones encontradas para usuario ${decoded.userId}: ${conversations.length}`);
      
      return conversations;
    } catch (error) {
      console.error('❌ Error obteniendo conversaciones:', error);
      throw error;
    }
  }

  async saveConversation(token, data) {
    try {
      const decoded = this.decodeToken(token);
      const { participantId, messages = [] } = data;

      // Obtener datos de usuarios
      const currentUser = await userRepository.findById(decoded.userId);
      const otherUser = await userRepository.findById(participantId);

      if (!currentUser || !otherUser) {
        throw new Error('Usuario no encontrado');
      }

      // Buscar o crear conversación
      let conversation = await chatRepository.findConversationBetween(decoded.userId, participantId);
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

      // Guardar solo mensajes NO GUARDADOS
      if (messages.length > 0) {
        // Obtener IDs de mensajes ya guardados
        const existingMessages = await chatRepository.findExistingMessages(decoded.userId, participantId);
        const existingMessageIds = new Set(existingMessages.map(m => m.messageId));
        const existingTimestamps = new Set(existingMessages.map(m => m.timestamp.getTime()));

        for (const msg of messages) {
          try {
            const messageId = msg.messageId || `msg_${msg.from}_${msg.to}_${new Date(msg.timestamp).getTime()}_${Math.random().toString(36).substr(2, 9)}`;
            const timestamp = new Date(msg.timestamp);
            
            // Verificar duplicados por ID Y timestamp
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
                username: msg.from === decoded.userId ? currentUser.username : otherUser.username,
                role: msg.from === decoded.userId ? currentUser.roleData.role_name : otherUser.roleData.role_name,
                name: msg.from === decoded.userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
              },
              receiver: {
                userId: msg.to,
                username: msg.to === decoded.userId ? currentUser.username : otherUser.username,
                role: msg.to === decoded.userId ? currentUser.roleData.role_name : otherUser.roleData.role_name,
                name: msg.to === decoded.userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
              }
            };

            // Guardar mensaje
            await chatRepository.saveMessage(messageData);
            newMessagesCount++;
            
            // Añadir a sets para evitar duplicados en la misma sesión
            existingMessageIds.add(messageId);
            existingTimestamps.add(timestamp.getTime());
            
          } catch (error) {
            if (error.code === 11000) { // Duplicado en DB
              duplicateCount++;
            } else {
              throw error;
            }
          }
        }

        // Actualizar conversación si hay mensajes nuevos
        if (newMessagesCount > 0) {
          const lastMessage = messages[messages.length - 1];
          await chatRepository.updateLastActivity(
            conversation._id,
            lastMessage.text || lastMessage.content,
            new Date(lastMessage.timestamp),
            lastMessage.from === decoded.userId ? `${currentUser.name} ${currentUser.surnames}` : `${otherUser.name} ${otherUser.surnames}`
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

  async downloadConversation(token, conversationId, res) {
    try {
      const decoded = this.decodeToken(token);

      // Verificar que el usuario tiene acceso a la conversación
      const conversation = await chatRepository.findConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversación no encontrada');
      }

      const isParticipant = conversation.participants.some(p => p.userId === decoded.userId);
      if (!isParticipant) {
        throw new Error('No tienes acceso a esta conversación');
      }

      // Obtener todos los mensajes de la conversación
      const participantIds = conversation.participants.map(p => p.userId);
      const messages = await chatRepository.findMessagesBetween(participantIds[0], participantIds[1]);

      if (messages.length === 0) {
        throw new Error('No hay mensajes en esta conversación');
      }

      // Crear directorio de descargas si no existe
      const downloadsDir = './downloads';
      if (!require('fs').existsSync(downloadsDir)) {
        require('fs').mkdirSync(downloadsDir, { recursive: true });
      }

      // Configurar el escritor CSV
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const participantName = conversation.participants
        .find(p => p.userId !== decoded.userId)?.name || 'Unknown';
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

      // Preparar datos para CSV
      const csvData = messages.map(msg => ({
        timestamp: new Date(msg.timestamp).toLocaleString('es-ES'),
        senderName: msg.sender.name,
        senderRole: msg.sender.role === 'teacher' ? 'Profesor' : 'Estudiante',
        receiverName: msg.receiver.name,
        receiverRole: msg.receiver.role === 'teacher' ? 'Profesor' : 'Estudiante',
        content: msg.content
      }));

      // Escribir archivo CSV
      await csvWriter.writeRecords(csvData);

      console.log(`📥 ✅ Archivo CSV creado: ${filename} con ${csvData.length} mensajes`);

      // Enviar archivo para descarga
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error enviando archivo:', err);
          res.status(500).json({ error: 'Error enviando archivo' });
        }
        
        // Limpiar archivo temporal después de un tiempo
        setTimeout(() => {
          require('fs').unlink(filepath, (cleanupError) => {
            if (cleanupError) {
              console.error('Error eliminando archivo temporal:', cleanupError);
            } else {
              console.log(`🗑️ Archivo temporal eliminado: ${filename}`);
            }
          });
        }, 60000); // 1 minuto
      });

    } catch (error) {
      console.error('❌ Error descargando conversación:', error);
      throw error;
    }
  }

  buildAvatarUrl(avatarPath) {
    if (!avatarPath) return null;
    
    // Si ya es una URL completa (S3), devolverla tal como está
    if (avatarPath.startsWith('http')) {
      return avatarPath;
    }
    
    // Si es un path local, construir URL completa
    return `http://localhost:3000/uploads/avatars/${avatarPath}`;
  }
}

module.exports = new ChatService();