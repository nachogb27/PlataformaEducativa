<template>
  <div class="chat-container">
    <aside class="chat-sidebar">
      <input v-model="search" placeholder="Buscar contacto..." class="chat-search" />
      <ul class="chat-list">
        <li v-for="contact in filteredContacts" :key="contact.id" :class="{active: contact.id === selectedContact?.id}" @click="selectContact(contact)">
          <img :src="contact.avatar" class="avatar" />
          <span>{{ contact.name }}</span>
        </li>
      </ul>
    </aside>
    <main class="chat-main" v-if="selectedContact">
      <header class="chat-header">
        <img :src="selectedContact.avatar" class="avatar" />
        <span>{{ selectedContact.name }}</span>
      </header>
      <section class="chat-messages" ref="messagesEnd">
        <div v-for="msg in messages" :key="msg.id" :class="['chat-message', {mine: msg.mine}]">
          <span class="msg-user">{{ msg.mine ? 'Tú' : selectedContact.name }}</span>
          <span class="msg-text">{{ msg.text }}</span>
          <span class="msg-time">{{ formatTime(msg.time) }}</span>
        </div>
      </section>
      <footer class="chat-input">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Escribe un mensaje..." />
        <button @click="sendMessage">Enviar</button>
      </footer>
    </main>
    <main class="chat-main empty" v-else>
      <p>Selecciona un contacto para chatear</p>
    </main>
  </div>
</template>

<script>
import WSClient from '../utils/wsClient'
import dataService from '../services/dataService'

const WS_URL = 'ws://localhost:3001' // Cambia el puerto si tu ws-server usa otro

export default {
  name: 'ChatView',
  data() {
    return {
      contacts: [],
      search: '',
      selectedContact: null,
      messages: [],
      newMessage: '',
      ws: null,
      user: null,
    }
  },
  computed: {
    filteredContacts() {
      const s = this.search.toLowerCase()
      return this.contacts.filter(c => c.name.toLowerCase().includes(s))
    }
  },
  async created() {
    // Obtener usuario actual
    this.user = JSON.parse(localStorage.getItem('user'))
    // Obtener contactos según rol
    if (this.user?.role === 'student') {
      this.contacts = await dataService.getStudentTeachers()
    } else if (this.user?.role === 'teacher') {
      this.contacts = await dataService.getTeacherStudents()
    }
    // Formatear contactos
    this.contacts = this.contacts.map(c => ({
      id: c.id || c.id_user || c.id_teacher || c.id_student,
      name: c.username || c.name || c.fullname,
      avatar: c.avatar || require('../assets/logo.png'),
    }))
    // Conectar WebSocket
    this.ws = new WSClient(WS_URL)
    this.ws.connect()
    this.ws.on('message', this.onWSMessage)
  },
  beforeDestroy() {
    if (this.ws) this.ws.close()
  },
  methods: {
    selectContact(contact) {
      this.selectedContact = contact
      this.messages = [] // Aquí deberías cargar el historial real
    },
    sendMessage() {
      if (!this.newMessage.trim() || !this.selectedContact) return
      const msg = {
        to: this.selectedContact.id,
        from: this.user.id,
        text: this.newMessage,
        time: Date.now(),
      }
      this.ws.send(msg)
      this.messages.push({ ...msg, mine: true, id: Date.now() + Math.random() })
      this.newMessage = ''
      this.$nextTick(() => this.scrollToEnd())
    },
    onWSMessage(msg) {
      // Solo mostrar mensajes del contacto seleccionado
      if (msg.from === this.selectedContact?.id || msg.to === this.selectedContact?.id) {
        this.messages.push({ ...msg, mine: msg.from === this.user.id, id: Date.now() + Math.random() })
        this.$nextTick(() => this.scrollToEnd())
      }
    },
    scrollToEnd() {
      const el = this.$refs.messagesEnd
      if (el) el.scrollTop = el.scrollHeight
    },
    formatTime(ts) {
      const d = new Date(ts)
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 80vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  overflow: hidden;
}
.chat-sidebar {
  width: 260px;
  background: #f7f7fa;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}
.chat-search {
  margin: 16px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 0 0 16px 0;
}
.chat-list li {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}
.chat-list li.active, .chat-list li:hover {
  background: #e6eaff;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
  background: #eee;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9faff;
}
.chat-main.empty {
  align-items: center;
  justify-content: center;
  display: flex;
  color: #888;
}
.chat-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chat-message {
  max-width: 60%;
  padding: 10px 14px;
  border-radius: 12px;
  background: #e6eaff;
  align-self: flex-start;
  position: relative;
  font-size: 15px;
}
.chat-message.mine {
  background: #c7f5d9;
  align-self: flex-end;
}
.msg-user {
  font-size: 12px;
  color: #888;
  margin-right: 8px;
}
.msg-time {
  font-size: 11px;
  color: #bbb;
  margin-left: 8px;
}
.chat-input {
  display: flex;
  padding: 12px 16px;
  background: #fff;
  border-top: 1px solid #eee;
}
.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-right: 8px;
}
.chat-input button {
  padding: 8px 18px;
  border-radius: 8px;
  background: #4f8cff;
  color: #fff;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.chat-input button:hover {
  background: #2563eb;
}
</style>
