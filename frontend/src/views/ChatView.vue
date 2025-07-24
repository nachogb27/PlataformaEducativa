<template>
  <div class="chat-container">
    <!-- Header del chat -->
    <div class="chat-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="chat-title">
            <h1>{{ $t('ChatView.title') }}</h1>
            <p v-if="selectedUser">{{ selectedUser.name }} {{ selectedUser.surnames }}</p>
            <p v-else>{{ $t('ChatView.selectUser') }}</p>
          </div>
        </div>
        <div class="header-actions">
          <LanguageSwitcher />
          <button 
            v-if="currentMessages.length > 0" 
            @click="saveConversation"
            class="save-button"
            :disabled="saving"
            :title="$t('ChatView.save')"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21H5C4.45 21 3.98 20.8 3.59 20.41C3.2 20.02 3 19.55 3 19V5C3 4.45 3.2 3.98 3.59 3.59C3.98 3.2 4.45 3 5 3H16L21 8V19C21 19.55 20.8 20.02 20.41 20.41C20.02 20.8 19.55 21 19 21ZM5 5V19H19V9L15 5H5ZM7 7H13V9H7V7Z" fill="currentColor"/>
            </svg>
            {{ saving ? $t('ChatView.saving') : $t('ChatView.save') }}
          </button>
          <button @click="showHistoryModal = true" class="history-button" :title="$t('ChatView.history')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 3C8.03 3 4 7.03 4 12H1L4.89 15.89L4.96 16.03L9 12H6C6 8.13 9.13 5 13 5S20 8.13 20 12S16.87 19 13 19C11.07 19 9.32 18.21 8.06 16.94L6.64 18.36C8.27 20 10.5 21 13 21C18.97 21 24 16.97 24 12S18.97 3 13 3ZM12 8V13L16.28 15.54L17 14.33L13.5 12.25V8H12Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="chat-content">
      <!-- Sidebar de usuarios -->
      <div class="users-sidebar">
        <div class="sidebar-header">
          <h3>{{ user?.role === 'teacher' ? $t('ChatView.students') : $t('ChatView.teachers') }}</h3>
          <div class="connection-status">
            <div :class="['status-indicator', connectionStatus]"></div>
            <span class="status-text">{{ $t('ChatView.connection') }}: {{ connectionText }}</span>
          </div>
        </div>
        
        <div v-if="loadingUsers" class="loading-users">
          <div class="spinner-small"></div>
          <p>{{ $t('ChatView.loadingUsers') }}</p>
        </div>

        <div v-else-if="availableUsers.length === 0" class="no-users">
          <p>{{ $t('ChatView.noUsers') }}</p>
        </div>

        <div v-else class="users-list">
          <div 
            v-for="userItem in availableUsers" 
            :key="userItem.userId"
            :class="['user-item', { active: selectedUser?.userId === userItem.userId }]"
            @click="selectUser(userItem)"
          >
            <div class="user-avatar">
              <img v-if="userItem.avatar" :src="userItem.avatar" :alt="userItem.name" />
              <span v-else>{{ userItem.name.charAt(0) }}</span>
            </div>
            <div class="user-info">
              <span class="user-name">{{ userItem.name }} {{ userItem.surnames }}</span>
              <span class="user-role">{{ userItem.role === 'teacher' ? $t('ChatView.teachers') : $t('ChatView.students') }}</span>
            </div>
            <div v-if="onlineUsers.has(userItem.userId)" class="online-indicator" :title="$t('ChatView.connected')"></div>
          </div>
        </div>
      </div>

      <!-- Área de chat -->
      <div class="chat-area">
        <div v-if="!selectedUser" class="no-chat-selected">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>{{ $t('ChatView.selectUser') }}</h3>
          <p>{{ $t('ChatView.selectUserDescription') }}</p>
        </div>

        <div v-else class="chat-messages-container">
          <!-- Mensajes -->
          <div class="messages-area" ref="messagesArea">
            <div v-if="loadingMessages" class="loading-messages">
              <div class="spinner"></div>
              <p>{{ $t('ChatView.loadingMessages') }}</p>
            </div>

            <div v-else-if="currentMessages.length === 0" class="no-messages">
              <p>{{ $t('ChatView.noMessages') }}</p>
            </div>

            <div v-else class="messages-list">
              <div 
                v-for="message in currentMessages" 
                :key="message.timestamp"
                :class="['message', { 
                  'own-message': message.from === user.id,
                  'other-message': message.from !== user.id 
                }]"
              >
                <div class="message-content">
                  <div class="message-text">{{ message.text }}</div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Área de escritura -->
          <div class="message-input-area">
            <form @submit.prevent="sendMessage" class="message-form">
              <div class="input-container">
                <textarea 
                  v-model="newMessage"
                  :placeholder="$t('ChatView.typeMessage')"
                  class="message-input"
                  rows="1"
                  @keydown="handleKeyDown"
                  @input="adjustTextareaHeight"
                  ref="messageInput"
                ></textarea>
                <button 
                  type="submit" 
                  class="send-button"
                  :disabled="!newMessage.trim() || !connectionStatus === 'connected'"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de historial -->
    <div v-if="showHistoryModal" class="modal-overlay" @click="closeHistoryModal">
      <div class="modal-content history-modal" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('ChatView.history') }}</h3>
          <button @click="closeHistoryModal" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="loadingHistory" class="loading">
            <div class="spinner"></div>
            <p>{{ $t('ChatView.loadingHistory') }}</p>
          </div>

          <div v-else-if="conversationHistory.length === 0" class="no-history">
            <p>{{ $t('ChatView.noHistory') }}</p>
          </div>

          <div v-else class="conversations-list">
            <div 
              v-for="conversation in conversationHistory" 
              :key="conversation._id"
              class="conversation-item"
            >
              <div class="conversation-info">
                <div class="participant-names">
                  <strong>{{ getOtherParticipantName(conversation) }}</strong>
                </div>
                <div class="conversation-meta">
                  <span class="message-count">{{ conversation.messageCount }} {{ $t('ChatView.messages') }}</span>
                  <span class="conversation-date">{{ formatDate(conversation.updatedAt) }}</span>
                </div>
                <div v-if="conversation.lastMessage" class="last-message">
                  <strong>{{ conversation.lastMessage.senderName }}:</strong>
                  {{ conversation.lastMessage.content.length > 50 
                    ? conversation.lastMessage.content.substring(0, 50) + '...' 
                    : conversation.lastMessage.content }}
                </div>
              </div>
              <div class="conversation-actions">
                <button 
                  @click="downloadConversation(conversation._id, getOtherParticipantName(conversation))"
                  class="download-button"
                  :title="$t('ChatView.downloadCSV')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'ChatView',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      user: null,
      availableUsers: [],
      selectedUser: null,
      currentMessages: [],
      newMessage: '',
      ws: null,
      connectionStatus: 'disconnected', // 'disconnected', 'connecting', 'connected'
      onlineUsers: new Set(),
      loadingUsers: true,
      loadingMessages: false,
      saving: false,
      showHistoryModal: false,
      conversationHistory: [],
      loadingHistory: false,
      notification: null
    }
  },
  computed: {
    connectionText() {
      switch (this.connectionStatus) {
        case 'connected': return 'En línea'
        case 'connecting': return 'Conectando...'
        default: return 'Desconectado'
      }
    }
  },
  async mounted() {
    await this.initializeChat()
  },
  beforeDestroy() {
    this.disconnectWebSocket()
  },
  methods: {
    async initializeChat() {
      // Verificar autenticación
      if (!authService.isAuthenticated()) {
        this.$router.push('/login')
        return
      }

      this.user = authService.getUser()
      console.log('👤 Usuario actual:', this.user)

      await this.loadAvailableUsers()
      this.connectWebSocket()
    },

    async loadAvailableUsers() {
      try {
        this.loadingUsers = true
        const response = await fetch('http://localhost:3000/api/chat/available-users', {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error cargando usuarios')
        }

        this.availableUsers = await response.json()
        console.log('✅ Usuarios disponibles cargados:', this.availableUsers.length)
      } catch (error) {
        console.error('❌ Error cargando usuarios:', error)
        this.showNotification('Error cargando usuarios: ' + error.message, 'error')
      } finally {
        this.loadingUsers = false
      }
    },

    connectWebSocket() {
      try {
        this.connectionStatus = 'connecting'
        this.ws = new WebSocket('ws://localhost:3000')

        this.ws.onopen = () => {
          console.log('🔗 WebSocket conectado')
          this.connectionStatus = 'connected'
          
          // Registrar usuario
          this.ws.send(JSON.stringify({
            type: 'register',
            userId: this.user.id
          }))
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.handleWebSocketMessage(data)
          } catch (error) {
            console.error('Error procesando mensaje WebSocket:', error)
          }
        }

        this.ws.onclose = () => {
          console.log('🔌 WebSocket desconectado')
          this.connectionStatus = 'disconnected'
          
          // Reconectar automáticamente después de 3 segundos
          setTimeout(() => {
            if (this.connectionStatus === 'disconnected') {
              this.connectWebSocket()
            }
          }, 3000)
        }

        this.ws.onerror = (error) => {
          console.error('❌ Error WebSocket:', error)
          this.connectionStatus = 'disconnected'
        }

      } catch (error) {
        console.error('Error conectando WebSocket:', error)
        this.connectionStatus = 'disconnected'
      }
    },

    disconnectWebSocket() {
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }
    },

    handleWebSocketMessage(data) {
      console.log('📨 Mensaje WebSocket recibido:', data)

      switch (data.type) {
        case 'registered':
          console.log('✅ Usuario registrado en WebSocket')
          break

        case 'message':
          // Mensaje recibido de otro usuario
          if (this.selectedUser && data.from === this.selectedUser.userId) {
            this.currentMessages.push({
              from: data.from,
              to: data.to,
              text: data.text,
              timestamp: data.timestamp
            })
            this.scrollToBottom()
          }
          this.showNotification(`Nuevo mensaje de ${data.senderName}`, 'info')
          break

        case 'message_sent':
          // Confirmación de mensaje enviado
          console.log('✅ Mensaje enviado confirmado')
          break

        case 'history':
          // Historial de mensajes recibido
          this.currentMessages = data.messages || []
          this.scrollToBottom()
          break

        case 'error':
          console.error('❌ Error del servidor:', data.message)
          this.showNotification('Error: ' + data.message, 'error')
          break
      }
    },

    async selectUser(userItem) {
      if (this.selectedUser?.userId === userItem.userId) return

      console.log('👤 Seleccionando usuario:', userItem)
      this.selectedUser = userItem
      this.currentMessages = []
      this.loadingMessages = true

      // Solicitar historial de mensajes
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'get_history',
          with: userItem.userId
        }))
      }

      // Timeout para loading
      setTimeout(() => {
        this.loadingMessages = false
      }, 2000)
    },

    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedUser || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        return
      }
      const timestamp = new Date();
      const messageId = `msg_${this.user.id}_${this.selectedUser.userId}_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;

      const messageData = {
        type: 'message',
        from: this.user.id,
        to: this.selectedUser.userId,
        text: this.newMessage.trim(),
        timestamp: timestamp,
        messageId: messageId  // 🆕 Añadir ID único
      }

      // Añadir mensaje a la lista local inmediatamente
      this.currentMessages.push(messageData)
      
      // Enviar por WebSocket
      this.ws.send(JSON.stringify(messageData))

      // Limpiar input
      this.newMessage = ''
      this.adjustTextareaHeight()
      this.scrollToBottom()

      console.log('📤 Mensaje enviado:', messageData)
    },

    async saveConversation() {
      if (this.currentMessages.length === 0 || !this.selectedUser) {
        this.showNotification(this.$t('ChatView.noMessagesToSave'), 'warning')
        return
      }

      try {
        this.saving = true
        const response = await fetch('http://localhost:3000/api/chat/save-conversation', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            participantId: this.selectedUser.userId,
            messages: this.currentMessages
          })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || this.$t('ChatView.errorSaving'))
        }

        const result = await response.json()
        console.log('✅ Conversación guardada:', result)
        this.showNotification(this.$t('ChatView.savedSuccessfully'), 'success')

      } catch (error) {
        console.error('❌ Error guardando conversación:', error)
        this.showNotification(this.$t('ChatView.errorSaving') + ': ' + error.message, 'error')
      } finally {
        this.saving = false
      }
    },

    async loadConversationHistory() {
      try {
        this.loadingHistory = true
        const response = await fetch('http://localhost:3000/api/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error cargando historial')
        }

        this.conversationHistory = await response.json()
        console.log('✅ Historial cargado:', this.conversationHistory.length)

      } catch (error) {
        console.error('❌ Error cargando historial:', error)
        this.showNotification('Error cargando historial: ' + error.message, 'error')
      } finally {
        this.loadingHistory = false
      }
    },

    async downloadConversation(conversationId, participantName) {
      try {
        this.showNotification('Preparando descarga...', 'info')
        
        const response = await fetch(`http://localhost:3000/api/chat/download/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error descargando conversación')
        }

        // Crear elemento para descarga
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `chat_${participantName}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        this.showNotification('Conversación descargada exitosamente', 'success')

      } catch (error) {
        console.error('❌ Error descargando conversación:', error)
        this.showNotification('Error descargando conversación: ' + error.message, 'error')
      }
    },

    closeHistoryModal() {
      this.showHistoryModal = false
    },

    async openHistoryModal() {
      this.showHistoryModal = true
      await this.loadConversationHistory()
    },

    getOtherParticipantName(conversation) {
      const otherParticipant = conversation.participants.find(p => p.userId !== this.user.id)
      return otherParticipant ? otherParticipant.name : 'Usuario desconocido'
    },

    showNotification(message, type = 'info') {
      this.notification = { message, type }
      setTimeout(() => {
        this.notification = null
      }, 4000)
    },

    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    },

    formatDate(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        this.sendMessage()
      }
    },

    adjustTextareaHeight() {
      const textarea = this.$refs.messageInput
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const messagesArea = this.$refs.messagesArea
        if (messagesArea) {
          messagesArea.scrollTop = messagesArea.scrollHeight
        }
      })
    },

    goBack() {
      // Determinar a dónde volver basado en el rol del usuario
      if (this.user?.role === 'teacher') {
        this.$router.push('/teacher-dashboard')
      } else {
        this.$router.push('/student-dashboard')
      }
    }
  },

  watch: {
    showHistoryModal(newValue) {
      if (newValue) {
        this.openHistoryModal()
      }
    }
  }
}
</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
.chat-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.chat-title h1 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.chat-title p {
  color: #718096;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.save-button,
.history-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.save-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

.save-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.history-button {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.history-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(237, 137, 54, 0.3);
}

/* Content */
.chat-content {
  flex: 1;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  min-height: calc(100vh - 100px);
}

/* Sidebar */
.users-sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.sidebar-header h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: #48bb78;
  box-shadow: 0 0 8px rgba(72, 187, 120, 0.5);
}

.status-indicator.connecting {
  background: #ed8936;
  animation: pulse 2s infinite;
}

.status-indicator.disconnected {
  background: #f56565;
}

.status-text {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.loading-users {
  padding: 40px 20px;
  text-align: center;
  color: #718096;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

.no-users {
  padding: 40px 20px;
  text-align: center;
  color: #718096;
  font-size: 14px;
}

.users-list {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.user-item:hover {
  background: rgba(102, 126, 234, 0.1);
}

.user-item.active {
  background: rgba(102, 126, 234, 0.15);
  border-right: 3px solid #667eea;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  background: linear-gradient(135deg, #667eea, #764ba2);
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  display: block;
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #48bb78;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(72, 187, 120, 0.5);
}

/* Chat Area */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.5);
}

.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
  text-align: center;
  padding: 40px;
}

.no-chat-selected h3 {
  color: #4a5568;
  margin: 16px 0 8px 0;
  font-size: 24px;
}

.chat-messages-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  max-height: 800px; 
  
  /* Scroll personalizado bonito */
  scrollbar-width: thin;
  scrollbar-color: rgba(102, 126, 234, 0.3) transparent;
}

/* Para navegadores WebKit (Chrome, Safari, Edge) */
.messages-area::-webkit-scrollbar {
  width: 8px;
}

.messages-area::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.2);
  border-radius: 4px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.5);
}

.loading-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #718096;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.no-messages {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-style: italic;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  max-width: 70%;
  word-wrap: break-word;
}

.own-message {
  align-self: flex-end;
}

.other-message {
  align-self: flex-start;
}

.message-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 18px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.own-message .message-content {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
  white-space: pre-wrap;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
  text-align: right;
}

/* Message Input */
.message-input-area {
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
}

.message-form {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-container {
  flex: 1;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 22px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.3s ease;
  outline: none;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.send-button {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.send-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-modal {
  width: 90%;
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
}

.modal-header h3 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #718096;
}

.no-history {
  text-align: center;
  padding: 60px;
  color: #718096;
  font-style: italic;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conversation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.conversation-item:hover {
  background: rgba(102, 126, 234, 0.05);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.participant-names {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 8px;
}

.conversation-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.message-count,
.conversation-date {
  font-size: 12px;
  color: #718096;
  background: rgba(255, 255, 255, 0.8);
  padding: 4px 8px;
  border-radius: 8px;
}

.last-message {
  font-size: 13px;
  color: #4a5568;
  background: rgba(255, 255, 255, 0.6);
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.conversation-actions {
  display: flex;
  gap: 8px;
}

.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

/* Notifications */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 14px;
  z-index: 3000;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
  max-width: 300px;
}

.notification.success {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.notification.error {
  background: linear-gradient(135deg, #f56565, #e53e3e);
}

.notification.warning {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
}

.notification.info {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .chat-content {
    flex-direction: column;
  }
  
  .users-sidebar {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  }
  
  .message {
    max-width: 85%;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .header-actions {
    gap: 8px;
  }
  
  .save-button,
  .history-button {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .history-modal {
    width: 95%;
    margin: 20px;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .chat-title h1 {
    font-size: 24px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .conversation-item {
    padding: 16px;
  }
  
  .message-input-area {
    padding: 16px;
  }
}
</style>