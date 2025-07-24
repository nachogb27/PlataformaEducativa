<template>
  <div class="chat-history-container">
     <div class="lang-switcher-wrapper">
      <LanguageSwitcher />
    </div>
    <div class="history-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="goBack" class="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="title-section">
            <h1>{{ $t('ChatHistoryView.title') }}</h1>
            <p>{{ $t('ChatHistoryView.subtitle') }}</p>
          </div>
        </div>
        <div class="header-stats" v-if="!loading">
          <div class="stat-item">
            <span class="stat-number">{{ conversationHistory.length }}</span>
            <span class="stat-label">{{ $t('ChatHistoryView.conversations') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ totalMessages }}</span>
            <span class="stat-label">{{ $t('ChatHistoryView.messages') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="history-content">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <h3>{{ $t('ChatHistoryView.loadingTitle') }}</h3>
        <p>{{ $t('ChatHistoryView.loadingDesc') }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#f56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>{{ $t('ChatHistoryView.errorLoading') }}</h3>
        <p>{{ error }}</p>
        <button @click="loadConversationHistory" class="retry-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M3.51 15A9 9 0 0 0 18.36 18.36L23 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('ChatHistoryView.retry') }}
        </button>
      </div>

      <div v-else-if="conversationHistory.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 9H7M11 13H7" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>{{ $t('ChatHistoryView.noConversations') }}</h3>
        <p>{{ $t('ChatHistoryView.noConversationsDesc') }}</p>
        <button @click="goToChat" class="start-chat-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ $t('ChatHistoryView.goToChat') }}
        </button>
      </div>

      <div v-else class="conversations-grid">
        <!-- Filtros -->
        <div class="filters-section">
          <div class="filter-group">
            <label>{{ $t('ChatHistoryView.searchConversations') }}</label>
            <div class="search-input-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input 
                type="text" 
                :placeholder="$t('ChatHistoryView.searchPlaceholder')"
                v-model="searchQuery"
                class="search-input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="filter-group">
            <label>Ordenar por:</label>
            <select v-model="sortBy" class="sort-select">
              <option value="recent">Más reciente</option>
              <option value="oldest">Más antiguo</option>
              <option value="messages">Más mensajes</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        <!-- Lista de conversaciones -->
        <div class="conversations-list">
          <div 
            v-for="conversation in filteredAndSortedConversations" 
            :key="conversation._id"
            class="conversation-card"
            :class="{ downloading: downloadingIds.has(conversation._id) }"
          >
            <div class="card-header">
              <div class="participant-info">
                <div class="participant-avatar">
                  <span>{{ getOtherParticipantName(conversation).charAt(0) }}</span>
                </div>
                <div class="participant-details">
                  <h4>{{ getOtherParticipantName(conversation) }}</h4>
                  <span class="participant-role">
                    {{ getOtherParticipantRole(conversation) }}
                  </span>
                </div>
              </div>
              
              <div class="conversation-actions">
                <button 
                  @click="viewConversationDetails(conversation)"
                  class="view-button"
                  title="Ver detalles"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  @click="downloadConversation(conversation._id, getOtherParticipantName(conversation))"
                  class="download-button"
                  :disabled="downloadingIds.has(conversation._id)"
                  title="Descargar CSV"
                >
                  <svg v-if="!downloadingIds.has(conversation._id)" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <div v-else class="download-spinner"></div>
                </button>
              </div>
            </div>

            <div class="card-content">
              <div class="conversation-stats">
                <div class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ conversation.messageCount }} mensajes</span>
                </div>
                <div class="stat">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>{{ formatDate(conversation.updatedAt) }}</span>
                </div>
              </div>

              <div v-if="conversation.lastMessage" class="last-message">
                <strong>{{ conversation.lastMessage.senderName }}:</strong>
                <span class="message-preview">
                  {{ conversation.lastMessage.content.length > 80 
                    ? conversation.lastMessage.content.substring(0, 80) + '...' 
                    : conversation.lastMessage.content }}
                </span>
              </div>

              <div class="conversation-timeline">
                <span class="created-date">
                  Iniciado: {{ formatDate(conversation.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Anterior
          </button>

          <div class="page-info">
            Página {{ currentPage }} de {{ totalPages }}
          </div>

          <button 
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            Siguiente
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de detalles de conversación -->
    <div v-if="selectedConversation" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <h3>Detalles de la Conversación</h3>
            <p>{{ getOtherParticipantName(selectedConversation) }}</p>
          </div>
          <button @click="closeDetailsModal" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="conversation-details">
            <div class="detail-section">
              <h4>Participantes</h4>
              <div class="participants-list">
                <div 
                  v-for="participant in selectedConversation.participants" 
                  :key="participant.userId"
                  class="participant-item"
                >
                  <div class="participant-avatar small">
                    {{ participant.name.charAt(0) }}
                  </div>
                  <div class="participant-info">
                    <span class="name">{{ participant.name }}</span>
                    <span class="role">{{ participant.role === 'teacher' ? 'Profesor' : 'Estudiante' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Estadísticas</h4>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15A2 2 0 0 1 19 17H7L4 20V5A2 2 0 0 1 6 3H19A2 2 0 0 1 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ selectedConversation.messageCount }}</span>
                    <span class="stat-label">Total mensajes</span>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ getDaysSinceCreated(selectedConversation.createdAt) }}</span>
                    <span class="stat-label">Días activa</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Último mensaje</h4>
              <div v-if="selectedConversation.lastMessage" class="last-message-detail">
                <div class="message-header">
                  <strong>{{ selectedConversation.lastMessage.senderName }}</strong>
                  <span class="message-time">{{ formatDateTime(selectedConversation.lastMessage.timestamp) }}</span>
                </div>
                <div class="message-content">{{ selectedConversation.lastMessage.content }}</div>
              </div>
              <div v-else class="no-messages">No hay mensajes en esta conversación</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="cancel-button">Cerrar</button>
          <button 
            @click="downloadConversation(selectedConversation._id, getOtherParticipantName(selectedConversation))"
            class="download-button primary"
            :disabled="downloadingIds.has(selectedConversation._id)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V15M7 10L12 15L17 10M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ downloadingIds.has(selectedConversation._id) ? 'Descargando...' : 'Descargar CSV' }}
          </button>
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
  name: 'ChatHistoryView',
    components: {
    LanguageSwitcher
  },
  data() {
    return {
      user: null,
      conversationHistory: [],
      loading: true,
      error: null,
      searchQuery: '',
      sortBy: 'recent',
      currentPage: 1,
      itemsPerPage: 12,
      selectedConversation: null,
      downloadingIds: new Set(),
      notification: null
    }
  },
  computed: {
    totalMessages() {
      return this.conversationHistory.reduce((total, conv) => total + conv.messageCount, 0)
    },

    filteredConversations() {
      let filtered = this.conversationHistory

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(conv => {
          const otherParticipant = conv.participants.find(p => p.userId !== this.user.id)
          return otherParticipant && otherParticipant.name.toLowerCase().includes(query)
        })
      }

      return filtered
    },

    sortedConversations() {
      const sorted = [...this.filteredConversations]
      
      switch (this.sortBy) {
        case 'recent':
          return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        case 'oldest':
          return sorted.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
        case 'messages':
          return sorted.sort((a, b) => b.messageCount - a.messageCount)
        case 'name':
          return sorted.sort((a, b) => {
            const nameA = this.getOtherParticipantName(a).toLowerCase()
            const nameB = this.getOtherParticipantName(b).toLowerCase()
            return nameA.localeCompare(nameB)
          })
        default:
          return sorted
      }
    },

    filteredAndSortedConversations() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.sortedConversations.slice(start, end)
    },

    totalPages() {
      return Math.ceil(this.sortedConversations.length / this.itemsPerPage)
    }
  },
  async mounted() {
    await this.initializeHistory()
  },
  methods: {
    async initializeHistory() {
      if (!authService.isAuthenticated()) {
        this.$router.push('/login')
        return
      }

      this.user = authService.getUser()
      await this.loadConversationHistory()
    },

    async loadConversationHistory() {
      try {
        this.loading = true
        this.error = null
        
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
        console.log('✅ Historial cargado:', this.conversationHistory.length, 'conversaciones')

      } catch (error) {
        console.error('❌ Error cargando historial:', error)
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async downloadConversation(conversationId, participantName) {
      try {
        this.downloadingIds.add(conversationId)
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
        a.download = `chat_${participantName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        this.showNotification(`Conversación con ${participantName} descargada exitosamente`, 'success')

      } catch (error) {
        console.error('❌ Error descargando conversación:', error)
        this.showNotification('Error descargando conversación: ' + error.message, 'error')
      } finally {
        this.downloadingIds.delete(conversationId)
      }
    },

    viewConversationDetails(conversation) {
      this.selectedConversation = conversation
    },

    closeDetailsModal() {
      this.selectedConversation = null
    },

    getOtherParticipantName(conversation) {
      const otherParticipant = conversation.participants.find(p => p.userId !== this.user.id)
      return otherParticipant ? otherParticipant.name : 'Usuario desconocido'
    },

    getOtherParticipantRole(conversation) {
      const otherParticipant = conversation.participants.find(p => p.userId !== this.user.id)
      if (!otherParticipant) return 'Rol desconocido'
      return otherParticipant.role === 'teacher' ? 'Profesor' : 'Estudiante'
    },

    formatDate(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        return 'Ayer'
      } else if (diffDays < 7) {
        return `Hace ${diffDays} días`
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7)
        return `Hace ${weeks} semana${weeks > 1 ? 's' : ''}`
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30)
        return `Hace ${months} mes${months > 1 ? 'es' : ''}`
      } else {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      }
    },

    formatDateTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getDaysSinceCreated(createdAt) {
      const created = new Date(createdAt)
      const now = new Date()
      const diffTime = Math.abs(now - created)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    },

    showNotification(message, type = 'info') {
      this.notification = { message, type }
      setTimeout(() => {
        this.notification = null
      }, 4000)
    },

    goBack() {
      if (this.user?.role === 'teacher') {
        this.$router.push('/teacher-dashboard')
      } else {
        this.$router.push('/student-dashboard')
      }
    },

    goToChat() {
      this.$router.push('/chat')
    }
  },

  watch: {
    searchQuery() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
.chat-history-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
}

/* Header */
.history-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
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

.title-section h1 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-section p {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

/* Content */
.history-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  width: 100%;
}

/* Loading, Error, Empty States */
.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 20px;
  color: #718096;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;
}

.error-state h3,
.empty-state h3 {
  color: #4a5568;
  font-size: 24px;
  margin: 16px 0 8px 0;
}

.retry-button,
.start-chat-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  margin-top: 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.retry-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
}

.start-chat-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.retry-button:hover,
.start-chat-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Filters */
.filters-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: end;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-group label {
  display: block;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.search-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-container svg {
  position: absolute;
  left: 16px;
  color: #a0aec0;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.clear-search:hover {
  background: #f7fafc;
  color: #4a5568;
}

.sort-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 180px;
}

.sort-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Conversations Grid */
.conversations-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.conversation-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.conversation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.conversation-card.downloading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: downloading 2s linear infinite;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.participant-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.participant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.participant-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.participant-details h4 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.participant-role {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

.conversation-actions {
  display: flex;
  gap: 8px;
}

.view-button,
.download-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.view-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.download-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.download-button.primary {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border-radius: 12px;
  width: auto;
  height: auto;
  padding: 12px 20px;
  font-weight: 600;
  gap: 8px;
}

.view-button:hover,
.download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.download-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.download-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.card-content {
  space-y: 16px;
}

.conversation-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
}

.last-message {
  background: rgba(102, 126, 234, 0.05);
  border-left: 3px solid #667eea;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.last-message strong {
  color: #4a5568;
}

.message-preview {
  color: #718096;
  font-size: 14px;
  line-height: 1.4;
  display: block;
  margin-top: 4px;
}

.conversation-timeline {
  padding-top: 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.created-date {
  color: #a0aec0;
  font-size: 12px;
  font-style: italic;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 40px;
}

.pagination-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #4a5568;
}

.pagination-button:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
}

.pagination-button:disabled {
  background: #f7fafc;
  color: #cbd5e0;
  cursor: not-allowed;
}

.page-info {
  color: #718096;
  font-weight: 500;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
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

.details-modal {
  width: 90%;
  max-width: 600px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title h3 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.modal-title p {
  color: #718096;
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

.conversation-details {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.detail-section h4 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.participant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
}

.participant-info .name {
  display: block;
  color: #2d3748;
  font-weight: 600;
  font-size: 14px;
}

.participant-info .role {
  display: block;
  color: #718096;
  font-size: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 16px;
  border-left: 4px solid #667eea;
}

.stat-icon {
  color: #667eea;
}

.stat-info .stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-info .stat-label {
  display: block;
  font-size: 12px;
  color: #718096;
  margin-top: 4px;
}

.last-message-detail {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  padding: 16px;
  border-left: 4px solid #667eea;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-header strong {
  color: #2d3748;
}

.message-time {
  color: #718096;
  font-size: 12px;
}

.message-content {
  color: #4a5568;
  line-height: 1.5;
}

.no-messages {
  color: #718096;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  background: rgba(248, 250, 252, 0.8);
}

.cancel-button {
  padding: 12px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #4a5568;
}

.cancel-button:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
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

.lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes downloading {
  0% { left: -100%; }
  100% { left: 100%; }
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
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-stats {
    gap: 16px;
  }
  
  .filters-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .conversations-list {
    grid-template-columns: 1fr;
  }
  
  .conversation-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 16px;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
}
</style>