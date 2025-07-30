<template>
  <div class="dashboard-container">
     <div class="lang-switcher-wrapper">
      <LanguageSwitcher />
    </div>
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1>{{ $t('TeacherDashboard.title') }}</h1>
          <p class="welcome-text">{{ $t('TeacherDashboard.subtitle') }}</p>
        </div>
        <div class="header-actions">
          <button @click="goToChat" class="chat-button" :title="$t('TeacherDashboard.chat')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button @click="goToSubjects" class="subjects-button" :title="$t('TeacherDashboard.manageSubjects')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7L12 12L21 7L12 2ZM3 17L12 22L21 17M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button @click="goToProfile" class="profile-button" :title="$t('TeacherDashboard.profile')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </button>
          <button @click="logout" class="logout-button" :title="$t('TeacherDashboard.logout')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.45 21 3.98 20.8 3.59 20.41C3.2 20.02 3 19.55 3 19V5C3 4.45 3.2 3.98 3.59 3.59C3.98 3.2 4.45 3 5 3H9V5H5V19H9V21ZM16 17L21 12L16 7V10H10V14H16V17Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-header">
        <h2>{{ $t('TeacherDashboard.studentsTitle') }}</h2>
      </div>
      
      <!-- Debug info expandido -->
      <div v-if="debugMode" class="debug-info">
        <h4>🔍 {{ $t('TeacherDashboard.debugTitle') }}</h4>
        <div class="debug-grid">
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.token') }}:</strong> {{ debugInfo.hasToken ? $t('TeacherDashboard.present') : $t('TeacherDashboard.absent') }}
          </div>
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.user') }}:</strong> {{ debugInfo.username || 'N/A' }}
          </div>
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.role') }}:</strong> {{ debugInfo.role || 'N/A' }}
          </div>
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.state') }}:</strong> {{ debugInfo.loadingState }}
          </div>
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.backendUrl') }}:</strong> {{ debugInfo.backendUrl }}
          </div>
          <div class="debug-item">
            <strong>{{ $t('TeacherDashboard.lastError') }}:</strong> {{ debugInfo.lastError || $t('TeacherDashboard.none') }}
          </div>
        </div>
        <div class="debug-actions">
          <button @click="testBackendConnection" class="debug-test-btn">🔗 {{ $t('TeacherDashboard.testConnection') }}</button>
          <button @click="showDetailedLogs" class="debug-test-btn">📋 {{ $t('TeacherDashboard.viewLogs') }}</button>
          <button @click="debugMode = false" class="debug-close">✕ {{ $t('TeacherDashboard.close') }}</button>
        </div>
      </div>
      
      <!-- Filtros de búsqueda -->
      <div v-if="!loading && !error && students.length > 0" class="search-filters">
        <div class="filter-group">
          <label>{{ $t('TeacherDashboard.searchByName') }}</label>
          <div class="input-with-clear">
            <input 
              type="text" 
              v-model="filters.name"
              :placeholder="$t('TeacherDashboard.namePlaceholder')"
              class="search-input"
            />
            <button @click="clearNameFilter" class="clear-button" :title="$t('common.clear')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="filter-group">
          <label>{{ $t('TeacherDashboard.searchByEmail') }}</label>
          <div class="input-with-clear">
            <input 
              type="text" 
              v-model="filters.email"
              :placeholder="$t('TeacherDashboard.emailPlaceholder')"
              class="search-input"
            />
            <button @click="clearEmailFilter" class="clear-button" :title="$t('common.clear')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ loadingMessage }}</p>
        <button @click="debugMode = true" class="debug-button">🔍 Debug</button>
      </div>
      
      <div v-else-if="error" class="error-message">
        <h3>❌ Error cargando datos</h3>
        <p>{{ error }}</p>
        <div v-if="debugInfo.lastError" class="error-details">
          <h4>Detalles técnicos:</h4>
          <pre>{{ debugInfo.lastError }}</pre>
        </div>
        <div class="error-actions">
          <button @click="retryLoad" class="retry-button">🔄 Reintentar</button>
          <button @click="debugMode = true" class="debug-button">🔍 Debug</button>
          <button @click="testBackendDirectly" class="test-button">🔧 Test Backend</button>
          <button @click="goToLogin" class="login-button">🔑 Ir a Login</button>
        </div>
      </div>
      
      <div v-else-if="students.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>No tienes estudiantes asignados</h3>
        <p>Los estudiantes aparecerán aquí cuando se inscriban en tus asignaturas</p>
        <button @click="goToSubjects" class="create-subjects-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7L12 12L21 7L12 2ZM3 17L12 22L21 17M3 12L12 17L21 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Gestionar Asignaturas
        </button>
      </div>
      
      <div v-else>
        <div class="table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th>{{ $t('TeacherDashboard.studentName') }}</th>
                <th>{{ $t('TeacherDashboard.studentSurname') }}</th>
                <th>{{ $t('TeacherDashboard.studentEmail') }}</th>
                <th>{{ $t('TeacherDashboard.subjectName') }}</th>
                <th>{{ $t('TeacherDashboard.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="`${student.id}-${student.subject}`">
                <td>
                  <div class="student-cell">
                    <div v-if="student.avatar" class="student-avatar-image">
                      <img :src="student.avatar" :alt="student.name" class="avatar-img" />
                    </div>
                    <div v-else class="student-avatar">{{ student.name.charAt(0) }}</div>
                    <span class="student-name">{{ student.name }}</span>
                  </div>
                </td>
                <td>
                  <span class="student-surname">{{ student.lastName }}</span>
                </td>
                <td>
                  <span class="student-email">{{ student.email }}</span>
                </td>
                <td>
                  <span class="subject-badge">{{ student.subject }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="editStudent(student)" 
                      class="action-button edit-button"
                      :title="$t('TeacherDashboard.editStudent')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      @click="deleteStudent(student)" 
                      class="action-button delete-button"
                      :title="$t('TeacherDashboard.deleteStudent')"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- Paginación -->
        <div v-if="filteredStudents.length > pageSize" class="pagination-container">
          <div class="pagination-info">
            {{$t('TeacherDashboard.paginationInfo', { start: startIndex + 1, end: endIndex, total: filteredStudents.length })}}
          </div>
          
          <div class="pagination-controls">
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-button"
              :title="$t('common.previous')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill="currentColor"/>
              </svg>
            </button>
            
            <span class="page-numbers">
              <button 
                v-for="page in visiblePages" 
                :key="page"
                @click="goToPage(page)"
                :class="['page-button', { active: page === currentPage }]"
              >
                {{ page }}
              </button>
            </span>
            
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="pagination-button"
              :title="$t('common.next')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.59 16.59L10 18L16 12L10 6L8.59 7.41L13.17 12L8.59 16.59Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('TeacherDashboard.editStudent') }}</h3>
          <button @click="closeEditModal" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveStudent" class="edit-form">
          <div class="form-group">
            <label for="editName">{{ $t('TeacherDashboard.name') }}:</label>
            <input 
              type="text" 
              id="editName" 
              v-model="editingStudent.name"
              required
              autocomplete="given-name"
            />
          </div>
          
          <div class="form-group">
            <label for="editSurnames">{{ $t('TeacherDashboard.surnames') }}:</label>
            <input 
              type="text" 
              id="editSurnames" 
              v-model="editingStudent.surnames"
              required
              autocomplete="family-name"
            />
          </div>
          
          <div class="form-group">
            <label for="editEmail">{{ $t('TeacherDashboard.email') }}:</label>
            <input 
              type="email" 
              id="editEmail" 
              v-model="editingStudent.email"
              required
              autocomplete="email"
            />
          </div>
          
          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-button">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="save-button" :disabled="saving">
              {{ saving ? $t('TeacherDashboard.saving') : $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import dataService from '@/services/dataService'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'TeacherDashboard',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      students: [],
      loading: true,
      error: null,
      loadingMessage: 'Cargando estudiantes...',
      showEditModal: false,
      editingStudent: {
        id: null,
        name: '',
        surnames: '',
        email: ''
      },
      editError: '',
      saving: false,
      // Filtros y paginación
      filters: {
        name: '',
        email: ''
      },
      currentPage: 1,
      pageSize: 5,
      // Debug mejorado
      debugMode: false,
      debugInfo: {
        hasToken: false,
        username: '',
        role: '',
        loadingState: 'initial',
        backendUrl: 'http://localhost:3000',
        lastError: null
      },
      logs: []
    }
  },
  async mounted() {
    this.log('🔄 TeacherDashboard mounted')
    await this.initializeDashboard()
  },
  computed: {
    filteredStudents() {
      let filtered = this.students;
      
      // Filtrar por nombre
      if (this.filters.name.trim()) {
        filtered = filtered.filter(student => 
          student.name.toLowerCase().includes(this.filters.name.toLowerCase()) ||
          student.lastName.toLowerCase().includes(this.filters.name.toLowerCase())
        );
      }
      
      // Filtrar por email
      if (this.filters.email.trim()) {
        filtered = filtered.filter(student => 
          student.email.toLowerCase().includes(this.filters.email.toLowerCase())
        );
      }
      
      return filtered;
    },
    
    totalPages() {
      return Math.ceil(this.filteredStudents.length / this.pageSize);
    },
    
    startIndex() {
      return (this.currentPage - 1) * this.pageSize;
    },
    
    endIndex() {
      return Math.min(this.startIndex + this.pageSize, this.filteredStudents.length);
    },
    
    paginatedStudents() {
      return this.filteredStudents.slice(this.startIndex, this.endIndex);
    },
    
    visiblePages() {
      const pages = [];
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, this.currentPage + 2);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      return pages;
    }
  },
  watch: {
    'filters.name'() {
      this.currentPage = 1;
    },
    'filters.email'() {
      this.currentPage = 1;
    }
  },
  methods: {
    log(message, data = null) {
      const timestamp = new Date().toLocaleTimeString()
      const logEntry = `[${timestamp}] ${message}`
      console.log(logEntry, data || '')
      this.logs.push(logEntry + (data ? ` ${JSON.stringify(data)}` : ''))
      if (this.logs.length > 50) this.logs.shift() // Mantener solo los últimos 50 logs
    },
    
    async initializeDashboard() {
      this.log('🔄 Inicializando dashboard del profesor...')
      
      try {
        // Verificar autenticación
        if (!authService.isAuthenticated()) {
          this.log('❌ Usuario no autenticado, redirigiendo a login')
          this.$router.push('/login')
          return
        }
        
        // Obtener información del usuario
        const user = authService.getUser()
        this.log('👤 Usuario actual:', user)
        
        this.debugInfo = {
          hasToken: !!authService.getToken(),
          username: user?.username || 'N/A',
          role: user?.role || 'N/A',
          loadingState: 'authenticated',
          backendUrl: 'http://localhost:3000',
          lastError: null
        }
        
        // Verificar que es profesor
        if (user?.role !== 'teacher') {
          this.log('❌ Usuario no es profesor:', user?.role)
          this.error = 'Acceso denegado: Solo los profesores pueden acceder a esta página'
          this.loading = false
          return
        }
        
        // Cargar estudiantes
        await this.loadStudents()
        
      } catch (error) {
        this.log('❌ Error inicializando dashboard:', error)
        this.debugInfo.lastError = error.toString()
        this.error = `Error de inicialización: ${error.message}`
        this.loading = false
      }
    },
    
    async loadStudents() {
      try {
        this.loadingMessage = 'Conectando con el servidor...'
        this.debugInfo.loadingState = 'loading'
        
        this.log('🔄 Cargando estudiantes del profesor...')
        
        // Verificar token antes de hacer la petición
        const token = authService.getToken()
        if (!token) {
          throw new Error('Token de autenticación no disponible')
        }
        
        this.log('🔑 Token encontrado, haciendo petición...')
        this.loadingMessage = 'Obteniendo lista de estudiantes...'
        
        // Usar try-catch específico para la petición
        try {
          this.students = await dataService.getTeacherStudents()
          this.log('✅ Estudiantes cargados:', this.students.length)
          this.debugInfo.loadingState = 'success'
        } catch (fetchError) {
          this.log('❌ Error específico en petición:', fetchError)
          
          // Si el error contiene HTML, es probable que el endpoint no exista
          if (fetchError.message.includes('DOCTYPE') || fetchError.message.includes('Unexpected token')) {
            throw new Error('El endpoint /api/teacher/students no está disponible o devuelve HTML en lugar de JSON. Verifica que el servidor esté corriendo y tenga todos los endpoints.')
          }
          
          throw fetchError
        }
        
      } catch (error) {
        this.log('❌ Error cargando estudiantes:', error)
        this.debugInfo.lastError = error.toString()
        this.error = error.message || 'Error desconocido al cargar estudiantes'
        this.debugInfo.loadingState = 'error'
        
        // Si es un error de autenticación, redirigir al login
        if (error.message.includes('Token') || error.message.includes('401') || error.message.includes('jwt')) {
          this.log('🔄 Error de autenticación, limpiando sesión...')
          authService.logout()
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      } finally {
        this.loading = false
      }
    },
    
    async retryLoad() {
      this.log('🔄 Reintentar carga...')
      this.loading = true
      this.error = null
      this.debugInfo.lastError = null
      await this.loadStudents()
    },
    
    async testBackendConnection() {
      this.log('🔗 Probando conexión con backend...')
      
      try {
        // Test básico
        const response = await fetch('http://localhost:3000/api/subjects')
        this.log(`📡 Respuesta básica: ${response.status}`)
        
        // Test con autenticación
        const token = authService.getToken()
        if (token) {
          const authResponse = await fetch('http://localhost:3000/api/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          this.log(`🔐 Respuesta con auth: ${authResponse.status}`)
          
          if (authResponse.ok) {
            const data = await authResponse.json()
            this.log('✅ Perfil obtenido:', data)
          }
        }
        
        alert('✅ Conexión probada - revisa la consola para detalles')
      } catch (error) {
        this.log('❌ Error probando conexión:', error)
        alert('❌ Error de conexión - revisa la consola')
      }
    },
    
    async testBackendDirectly() {
      this.log('🔧 Probando endpoint específico...')
      
      try {
        const token = authService.getToken()
        const response = await fetch('http://localhost:3000/api/teacher/students', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        this.log(`📡 Status: ${response.status}`)
        this.log(`📡 Headers:`, Object.fromEntries(response.headers.entries()))
        
        const text = await response.text()
        this.log(`📡 Respuesta cruda:`, text.substring(0, 200))
        
        if (response.ok) {
          try {
            const data = JSON.parse(text)
            this.log('✅ JSON válido:', data)
          } catch (parseError) {
            this.log('❌ Error parseando JSON:', parseError)
          }
        }
        
        alert('🔧 Test completado - revisa la consola para detalles')
      } catch (error) {
        this.log('❌ Error en test directo:', error)
        alert('❌ Error en test - revisa la consola')
      }
    },
    
    showDetailedLogs() {
      console.log('📋 === LOGS DETALLADOS ===')
      this.logs.forEach(log => console.log(log))
      alert('📋 Logs mostrados en la consola')
    },
    
    async logout() {
      try {
        this.log('🔄 Cerrando sesión...')
        await authService.logout()
        this.$router.push('/login')
      } catch (error) {
        this.log('Error en logout:', error)
        this.$router.push('/login')
      }
    },
    
    goToProfile() {
      this.$router.push('/profile')
    },
    
    goToSubjects() {
      this.log('🔄 Navegando a asignaturas...')
      this.$router.push('/subjects')
    },
    
    goToLogin() {
      authService.logout()
      this.$router.push('/login')
    },
     goToChat() {
      this.$router.push('/chat')
    },
    
    // Métodos de filtrado
    clearNameFilter() {
      this.filters.name = '';
    },
    
    clearEmailFilter() {
      this.filters.email = '';
    },
    
    // Métodos de paginación
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },

    // Método para abrir el modal de edición
    editStudent(student) {
      this.log('✏️ Editando estudiante:', student)
      this.editingStudent = {
        id: student.id,
        name: student.name,
        surnames: student.lastName,
        email: student.email
      }
      this.showEditModal = true
      this.editError = ''
    },

    // Método para cerrar el modal de edición
    closeEditModal() {
      this.showEditModal = false
      this.editingStudent = {
        id: null,
        name: '',
        surnames: '',
        email: ''
      }
      this.editError = ''
    },

    // Método para guardar cambios de estudiante (edición)
    async saveStudent() {
      this.editError = '';
      this.saving = true;
      
      try {
        this.log('💾 Guardando cambios del estudiante:', this.editingStudent)
        
        await dataService.editStudent(this.editingStudent.id, {
          name: this.editingStudent.name,
          surnames: this.editingStudent.surnames,
          email: this.editingStudent.email
        });

        // Actualizar la lista local
        const studentIndex = this.students.findIndex(s => s.id === this.editingStudent.id);
        if (studentIndex !== -1) {
          this.students[studentIndex].name = this.editingStudent.name;
          this.students[studentIndex].lastName = this.editingStudent.surnames;
          this.students[studentIndex].email = this.editingStudent.email;
        }

        this.log('✅ Estudiante actualizado correctamente')
        this.closeEditModal();
        
        // Mostrar mensaje de éxito
        alert('Estudiante actualizado correctamente');
        
      } catch (error) {
        this.log('❌ Error guardando estudiante:', error)
        this.editError = error.message || 'Error al guardar los cambios';
      } finally {
        this.saving = false;
      }
    },

    async deleteStudent(student) {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${student.name} ${student.lastName} de tu lista?`)) {
        try {
          this.log('🗑️ Eliminando estudiante:', student)
          await dataService.deleteStudent(student.id)
          
          // Eliminar de la lista local
          this.students = this.students.filter(s => s.id !== student.id)
          
          this.log('✅ Estudiante eliminado correctamente')
          alert(`${student.name} ${student.lastName} ha sido eliminado de tu lista`)
        } catch (error) {
          this.log('❌ Error eliminando estudiante:', error)
          alert('Error al eliminar el estudiante: ' + error.message)
        }
      }
    }
  }
}
</script>

<style scoped>
/* Todos los estilos anteriores más estos nuevos */
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-section h1 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-text {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.chat-button,
.profile-button,
.subjects-button,
.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.subjects-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
}

.subjects-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

.profile-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.profile-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.logout-button {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

.chat-button:hover::after,
.profile-button:hover::after,
.subjects-button:hover::after,
.logout-button:hover::after {
  content: attr(title);
  position: absolute;
  top: -40px;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.content-header h2 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

/* Debug info mejorado */
.debug-info {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  position: relative;
}

.debug-info h4 {
  margin: 0 0 16px 0;
  color: #856404;
  font-size: 16px;
}

.debug-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.debug-item {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 6px;
  font-size: 14px;
}

.debug-item strong {
  color: #856404;
}

.debug-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.debug-test-btn {
  padding: 6px 12px;
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.5);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: #856404;
  transition: all 0.3s ease;
}

.debug-test-btn:hover {
  background: rgba(255, 193, 7, 0.3);
}

.debug-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #856404;
  padding: 4px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin: 40px 0;
}

.error-message h3 {
  margin: 0 0 12px 0;
}

.error-details {
  background: rgba(0, 0, 0, 0.1);
  padding: 12px;
  border-radius: 6px;
  margin: 16px 0;
  text-align: left;
}

.error-details pre {
  margin: 0;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.retry-button,
.debug-button,
.test-button,
.login-button,
.create-subjects-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.retry-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.debug-button {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  color: white;
}

.test-button {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
  color: white;
}

.login-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.create-subjects-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #718096;
}

.empty-state svg {
  margin-bottom: 24px;
}

.empty-state h3 {
  color: #4a5568;
  margin: 0 0 12px 0;
  font-size: 24px;
}

.empty-state p {
  margin: 0 0 32px 0;
  font-size: 16px;
}

.table-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.students-table td {
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.students-table tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.student-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar,
.student-avatar-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.student-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.student-avatar-image {
  padding: 0;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.student-name {
  font-weight: 600;
  color: #2d3748;
}

.student-surname {
  color: #4a5568;
  font-weight: 500;
}

.student-email {
  color: #718096;
  font-size: 14px;
}

.subject-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.edit-button {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.edit-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
}

.delete-button {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.delete-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
}

.action-button:hover::after {
  content: attr(title);
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 1000;
}

/* Modal styles */
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
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
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
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f7fafc;
  color: #2d3748;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-button,
.save-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.cancel-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-button:hover {
  background: #edf2f7;
}

.save-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.save-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

/* Estilos para filtros */
.search-filters {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 8px;
}

.input-with-clear {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-button {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

/* Estilos para paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pagination-info {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
}

.pagination-button:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-button:disabled {
  background: #f7fafc;
  color: #cbd5e0;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-button {
  width: 36px;
  height: 36px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
  font-weight: 500;
}

.page-button:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

 .chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}
.chat-button {
    background: linear-gradient(135deg, #6a9de0, #64cffa);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }
  .chat-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
  }

  .lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

@media (max-width: 768px) {
  .search-filters {
    grid-template-columns: 1fr;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .error-actions {
    flex-direction: column;
  }
  
  .debug-actions {
    flex-direction: column;
  }
}
</style>