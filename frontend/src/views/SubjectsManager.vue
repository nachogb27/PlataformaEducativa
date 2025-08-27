<template>
  <div class="subjects-container">
    <div class="lang-switcher-wrapper">
      <LanguageSwitcher />
    </div>
    <div class="subjects-header">
      <div class="header-content">
        <div class="title-section">
          <button @click="goBack" class="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
            </svg>
          </button>
          <div>
            <h1>{{ isTeacher ? $t('SubjectsManager.titleTeacher') : $t('SubjectsManager.titleStudent') }}</h1>
            <p class="subtitle">{{ isTeacher ? $t('SubjectsManager.subtitleTeacher') : $t('SubjectsManager.subtitleStudent') }}</p>
          </div>
        </div>
        
        <div class="header-actions" v-if="isTeacher">
          <button @click="showCreateModal = true" class="create-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            {{ $t('SubjectsManager.newSubject') }}
          </button>
        </div>
      </div>
    </div>

    <div class="subjects-content">
      <div v-if="debugMode" class="debug-info">
        <h4>🔍 {{ $t('SubjectsManager.debug') }}</h4>
        <p>{{ $t('SubjectsManager.token') }}: {{ debugInfo.hasToken ? $t('SubjectsManager.present') : $t('SubjectsManager.absent') }}</p>
        <p>{{ $t('SubjectsManager.user') }}: {{ debugInfo.username || 'N/A' }}</p>
        <p>{{ $t('SubjectsManager.role') }}: {{ debugInfo.role || 'N/A' }}</p>
        <p>{{ $t('SubjectsManager.state') }}: {{ debugInfo.loadingState }}</p>
        <p>{{ $t('SubjectsManager.subjectsLoaded') }}: {{ subjects.length }}</p>
        <button @click="debugMode = false" class="debug-close">{{ $t('SubjectsManager.close') }}</button>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('SubjectsManager.loading') }}</p>
        <button @click="debugMode = true" class="debug-button">🔍 {{ $t('SubjectsManager.debug') }}</button>
      </div>

      <div v-else-if="error" class="error-message">
        <h3>❌ {{ $t('SubjectsManager.error') }}</h3>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="retryLoad" class="retry-button">🔄 {{ $t('SubjectsManager.retry') }}</button>
          <button @click="debugMode = true" class="debug-button">🔍 {{ $t('SubjectsManager.debug') }}</button>
        </div>
      </div>

      <div v-else-if="isTeacher" class="teacher-view">
        <div v-if="subjects.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7L12 12L21 7L12 2ZM3 17L12 22L21 17M3 12L12 17L21 12" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>{{ $t('SubjectsManager.noSubjects') }}</h3>
          <p>{{ $t('SubjectsManager.createFirst') }}</p>
          <button @click="showCreateModal = true" class="create-first-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
            </svg>
            {{ $t('SubjectsManager.newSubject') }}
          </button>
        </div>
        
        <div v-else class="subjects-grid">
          <div v-for="subject in subjects" :key="subject.id" class="subject-card teacher-card">
            <div class="card-header">
              <h3>{{ subject.subject_name }}</h3>
              <div class="card-actions">
                <button 
                  v-if="subject.isTeaching" 
                  @click="manageStudents(subject)" 
                  class="action-btn manage-btn" 
                  :title="$t('SubjectsManager.students')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button 
                  v-if="subject.isTeaching" 
                  @click="editSubject(subject)" 
                  class="action-btn edit-btn" 
                  :title="$t('common.edit')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  v-if="subject.isTeaching" 
                  @click="deleteSubject(subject)" 
                  class="action-btn delete-btn" 
                  :title="$t('common.delete')"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="card-content">
              <div v-if="subject.isTeaching" class="teaching-info">
                <div class="student-count">
                  <span class="count">{{ subject.studentCount || 0 }}</span>
                  <span class="label">{{ $t('SubjectsManager.students') }}</span>
                </div>
                <span class="teaching-badge">{{ $t('SubjectsManager.teaching') }}</span>
              </div>
              <div v-else class="not-teaching">
                <p>{{ $t('SubjectsManager.notTeaching') }}</p>
                <button @click="joinAsTeacher(subject)" class="join-button" :disabled="joining">
                  {{ joining ? $t('SubjectsManager.joining') : $t('SubjectsManager.join') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="student-view">
        <div v-if="subjects.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7L12 12L21 7L12 2ZM3 17L12 22L21 17M3 12L12 17L21 12" stroke="#cbd5e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3>{{ $t('SubjectsManager.noSubjects') }}</h3>
          <p>{{ $t('SubjectsManager.assignedByTeachers') }}</p>
        </div>
        <div v-else class="subjects-grid">
          <div v-for="subject in subjects" :key="subject.id" class="subject-card student-card">
            <div class="card-header">
              <h3>{{ subject.name }}</h3>
              <span class="status-badge enrolled">{{ $t('SubjectsManager.enrolled') }}:</span>
            </div>
            <div class="card-content">
              <div class="teacher-info">
                <span class="label">{{ $t('SubjectsManager.teacher') }}:</span>
                <span class="teacher-name">{{ subject.teacher }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showCreateModal ? $t('SubjectsManager.newSubject') : $t('SubjectsManager.editSubject') }}</h3>
          <button @click="closeModals" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="showCreateModal ? createSubject() : updateSubject()" class="subject-form">
          <div class="form-group">
            <label for="subjectName">{{ $t('SubjectsManager.subjectName') }}:</label>
            <input 
              type="text" 
              id="subjectName" 
              v-model="subjectForm.name"
              :placeholder=
              required
              maxlength="100"
            />
          </div>
          
          <div v-if="modalError" class="error-message">
            {{ modalError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModals" class="cancel-button">
              {{ $t('common.cancel') }}
            </button>
            <button type="submit" class="save-button" :disabled="saving">
              {{ saving ? $t('SubjectsManager.saving') : (showCreateModal ? $t('SubjectsManager.create') : $t('common.save')) }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showStudentsModal" class="modal-overlay" @click="closeStudentsModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>{{ $t('SubjectsManager.manageStudents') }} - {{ selectedSubject?.subject_name }}</h3>
          <button @click="closeStudentsModal" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <div class="students-management">
          <div class="assigned-students">
            <h4>{{ $t('SubjectsManager.assignedStudents') }} ({{ assignedStudents.length }})</h4>
            <div v-if="assignedStudents.length === 0" class="empty-list">
              <p>{{ $t('SubjectsManager.noAssignedStudents') }}</p>
            </div>
            <div v-else class="students-list">
              <div v-for="student in assignedStudents" :key="student.id" class="student-item assigned">
                <div class="student-info">
                  <div v-if="student.avatar" class="student-avatar">
                    <img :src="student.avatar" :alt="student.name" />
                  </div>
                  <div v-else class="student-avatar-placeholder">
                    {{ student.name.charAt(0) }}{{ student.surnames.charAt(0) }}
                  </div>
                  <div class="student-details">
                    <span class="student-name">{{ student.name }} {{ student.surnames }}</span>
                    <span class="student-email">{{ student.email }}</span>
                  </div>
                </div>
                <button @click="removeStudentFromSubject(student)" class="remove-button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 11H19V13H5V11Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="available-students">
              <h4>{{ $t('SubjectsManager.availableStudents') }} ({{ filteredAvailableStudents.length }})</h4>
              <div v-if="filteredAvailableStudents.length === 0" class="empty-list">
                <p>{{ $t('SubjectsManager.noAvailableStudents') }}</p>
              </div>
              <div v-else class="students-list">
                <div v-for="student in filteredAvailableStudents" :key="student.id" class="student-item available">
                  <div class="student-info">
                    <div v-if="student.avatar" class="student-avatar">
                      <img :src="student.avatar" :alt="student.name" />
                    </div>
                    <div v-else class="student-avatar-placeholder">
                      {{ student.name.charAt(0) }}{{ student.surnames.charAt(0) }}
                    </div>
                    <div class="student-details">
                      <span class="student-name">{{ student.name }} {{ student.surnames }}</span>
                      <span class="student-email">{{ student.email }}</span>
                    </div>
                  </div>
                  <button @click="assignStudentToSubject(student)" class="add-button">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dataService from '@/services/dataService'
import authService from '@/services/authService'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'SubjectsManager',
    components: {
    LanguageSwitcher
  },
  data() {
    return {
      loading: true,
      error: null,
      loadingMessage: 'Cargando asignaturas...',
      userRole: null,
      
      subjects: [], 
      showCreateModal: false,
      showEditModal: false,
      showStudentsModal: false,
      modalError: '',
      saving: false,
      joining: false,
      
      subjectForm: {
        id: null,
        name: ''
      },
      
      selectedSubject: null,
      assignedStudents: [],
      availableStudents: [],
      studentSearch: '',
      
      debugMode: false,
      debugInfo: {
        hasToken: false,
        username: '',
        role: '',
        loadingState: 'initial'
      }
    }
  },
  computed: {
    isTeacher() {
      return this.userRole === 'teacher'
    },
    
    filteredAvailableStudents() {
      if (!this.studentSearch.trim()) {
        return this.availableStudents
      }
      
      const search = this.studentSearch.toLowerCase()
      return this.availableStudents.filter(student => 
        student.name.toLowerCase().includes(search) ||
        student.surnames.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search)
      )
    }
  },
  async mounted() {
    console.log('🔄 SubjectsManager mounted')
    await this.initializeComponent()
  },
  methods: {
    async initializeComponent() {
      console.log('🔄 Inicializando gestor de asignaturas...')
      
      try {
        if (!authService.isAuthenticated()) {
          console.log('❌ Usuario no autenticado, redirigiendo a login')
          this.$router.push('/login')
          return
        }
        
        const user = authService.getUser()
        console.log('👤 Usuario actual:', user)
        
        this.userRole = user?.role
        this.debugInfo = {
          hasToken: !!authService.getToken(),
          username: user?.username || 'N/A',
          role: user?.role || 'N/A',
          loadingState: 'authenticated'
        }
        
        await this.loadData()
        
      } catch (error) {
        console.error('❌ Error inicializando componente:', error)
        this.error = `Error de inicialización: ${error.message}`
        this.loading = false
      }
    },
    
    async loadData() {
      try {
        this.loadingMessage = 'Conectando con el servidor...'
        this.debugInfo.loadingState = 'loading'
        
        if (this.isTeacher) {
          await this.loadTeacherData()
        } else {
          await this.loadStudentData()
        }
        
        this.debugInfo.loadingState = 'success'
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error)
        this.error = error.message || 'Error desconocido al cargar datos'
        this.debugInfo.loadingState = 'error'
        
        if (error.message.includes('Token') || error.message.includes('401') || error.message.includes('jwt')) {
          console.log('🔄 Error de autenticación, limpiando sesión...')
          authService.logout()
          setTimeout(() => {
            this.$router.push('/login')
          }, 2000)
        }
      } finally {
        this.loading = false
      }
    },
    
    async loadTeacherData() {
      this.loadingMessage = 'Cargando asignaturas del sistema...'
      
      const allSubjects = await dataService.getAllSubjects()
      
      const teacherSubjects = await dataService.getTeacherSubjects()
      
      this.subjects = allSubjects.map(subject => {
        const teachingSubject = teacherSubjects.find(ts => ts.id === subject.id)
        return {
          ...subject,
          isTeaching: !!teachingSubject,
          studentCount: teachingSubject?.studentCount || 0
        }
      })
      
      console.log('✅ Datos del profesor cargados:', this.subjects.length, 'asignaturas')
    },
    
    async loadStudentData() {
      this.loadingMessage = 'Cargando tus asignaturas...'
      
      this.subjects = await dataService.getStudentSubjects()
      
      console.log('✅ Datos del estudiante cargados:', this.subjects.length, 'asignaturas')
    },
    
    async retryLoad() {
      this.loading = true
      this.error = null
      await this.loadData()
    },
    
    async joinAsTeacher(subject) {
      if (this.joining) return

      const confirmMessage =  this.$t('SubjectsManager.joinSubjectQuestion', { subject: subject.subject_name })
      if (!confirm(confirmMessage)) return
      
      this.joining = true
      
      try {
        await dataService.joinAsTeacher(subject.id)
        alert(this.$t('SubjectsManager.joinSubjectComplete'), { subject: subject.subject_name })
        
        await this.loadTeacherData()
      } catch (error) {
        alert(this.$t('SubjectsManager.joinAsTeacherError', { message: error.message }))
      } finally {
        this.joining = false
      }
    },
    
    editSubject(subject) {
      this.subjectForm.id = subject.id
      this.subjectForm.name = subject.subject_name
      this.showEditModal = true
      this.modalError = ''
    },
    
    async createSubject() {
      if (this.saving) return
      
      this.saving = true
      this.modalError = ''
      
      try {
        await dataService.createSubject(this.subjectForm.name)
        alert(this.$t('SubjectsManager.createSubjectComplete'))

        this.closeModals()
        await this.loadTeacherData()
      } catch (error) {
        this.modalError = error.message || this.$t('SubjectsManager.createSubjectError')
      } finally {
        this.saving = false
      }
    },
    
    async updateSubject() {
      if (this.saving) return
      
      this.saving = true
      this.modalError = ''
      
      try {
        await dataService.updateSubject(this.subjectForm.id, this.subjectForm.name)
        alert(this.$t('SubjectsManager.updateSubjectComplete'), { subject: this.subjectForm.name })

        this.closeModals()
        await this.loadTeacherData()
      } catch (error) {
        this.modalError = error.message || this.$t('SubjectsManager.updateSubjectError')
      } finally {
        this.saving = false
      }
    },
    
    async deleteSubject(subject) {
      const confirmMessage = this.$t('SubjectsManager.deleteSubjectQuestion', { subject: subject.subject_name })
      if (!confirm(confirmMessage)) return
      
      try {
        await dataService.deleteSubject(subject.id)
        alert(this.$t('SubjectsManager.deleteSubjectComplete'))
        
        await this.loadTeacherData()
      } catch (error) {
        alert(this.$t('SubjectsManager.deleteSubjectError', { message: error.message }))
      }
    },
    
    async manageStudents(subject) {
      this.selectedSubject = subject
      this.showStudentsModal = true
      this.studentSearch = ''
      
      try {
        const [assigned, available] = await Promise.all([
          dataService.getAssignedStudents(subject.id),
          dataService.getAvailableStudents(subject.id)
        ])
        
        this.assignedStudents = assigned
        this.availableStudents = available
      } catch (error) {
        alert('Error cargando estudiantes: ' + error.message)
      }
    },
    
    async assignStudentToSubject(student) {
      try {
        await dataService.assignStudentToSubject(student.id, this.selectedSubject.id)
        
        this.availableStudents = this.availableStudents.filter(s => s.id !== student.id)
        this.assignedStudents.push(student)
        
        const subjectIndex = this.subjects.findIndex(s => s.id === this.selectedSubject.id)
        if (subjectIndex !== -1) {
          this.subjects[subjectIndex].studentCount = this.assignedStudents.length
        }
        
        alert(this.$t('SubjectsManager.studentAssigned', { name: student.name, surnames: student.surnames }))
      } catch (error) {
        alert('Error asignando estudiante: ' + error.message)
      }
    },
    
    async removeStudentFromSubject(student) {
      const confirmMessage = this.$t('SubjectsManager.removeStudentQuestion', { name: student.name, surnames: student.surnames })
      if (!confirm(confirmMessage)) return
      
      try {
        await dataService.removeStudentFromSubject(student.id, this.selectedSubject.id)
        
        this.assignedStudents = this.assignedStudents.filter(s => s.id !== student.id)
        this.availableStudents.push(student)
        
        const subjectIndex = this.subjects.findIndex(s => s.id === this.selectedSubject.id)
        if (subjectIndex !== -1) {
          this.subjects[subjectIndex].studentCount = this.assignedStudents.length
        }
        
        alert(this.$t('SubjectsManager.studentRemoved', { name: student.name, surnames: student.surnames }))
      } catch (error) {
        alert(this.$t('SubjectsManager.removeStudentError', { message: error.message }))
      }
    },
    
    closeModals() {
      this.showCreateModal = false
      this.showEditModal = false
      this.subjectForm = { id: null, name: '' }
      this.modalError = ''
    },
    
    closeStudentsModal() {
      this.showStudentsModal = false
      this.selectedSubject = null
      this.assignedStudents = []
      this.availableStudents = []
      this.studentSearch = ''
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('es-ES')
    },
    
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.subjects-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.subjects-header {
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

.title-section {
  display: flex;
  align-items: center;
  gap: 16px;
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
  background-clip: text;
}

.subtitle {
  color: #718096;
  font-size: 16px;
  margin: 0;
}

.create-button,
.create-first-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.create-button:hover,
.create-first-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(72, 187, 120, 0.3);
}

.subjects-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.debug-info {
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  position: relative;
  font-size: 14px;
}

.debug-close {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #856404;
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

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
  flex-wrap: wrap;
}

.retry-button,
.debug-button {
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

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.subject-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.subject-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-header h3 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  flex: 1;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.manage-btn {
  background: linear-gradient(135deg, #9f7aea, #805ad5);
  color: white;
}

.edit-btn {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  color: white;
}

.delete-btn {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.enrolled {
  background: rgba(72, 187, 120, 0.1);
  color: #38a169;
}

.teaching-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.teaching-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-count {
  text-align: center;
  padding: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
}

.student-count .count {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.student-count .label {
  font-size: 12px;
  color: #718096;
  font-weight: 500;
}

.not-teaching {
  text-align: center;
  padding: 16px;
}

.join-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.join-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.join-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.teacher-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.teacher-name {
  color: #2d3748;
  font-weight: 500;
}

.subject-details {
  font-size: 12px;
  color: #718096;
}

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

.modal-content.large {
  max-width: 900px;
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

.subject-form {
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

.students-management {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-top: 24px;
}

.assigned-students h4,
.available-students h4 {
  color: #2d3748;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.search-box {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.students-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.student-item:hover {
  background: #f7fafc;
}

.student-item.assigned {
  background: rgba(72, 187, 120, 0.05);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

.student-item.available {
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar,
.student-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.student-avatar-placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.student-details {
  display: flex;
  flex-direction: column;
}

.student-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.student-email {
  color: #718096;
  font-size: 12px;
}

.add-button,
.remove-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  color: white;
}

.add-button {
  background: linear-gradient(135deg, #38b2ac, #319795);
  box-shadow: 0 4px 6px rgba(56, 178, 172, 0.3);
}

.remove-button {
  background: linear-gradient(135deg, #f56565, #c53030);
  box-shadow: 0 4px 6px rgba(245, 101, 101, 0.3);
}

.add-button:hover,
.remove-button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.add-button:active,
.remove-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.empty-list {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
  font-style: italic;
}

.lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

@media (max-width: 768px) {
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .students-management {
    grid-template-columns: 1fr;
  }
  
  .modal-content.large {
    max-width: 95%;
  }
}
</style>
  