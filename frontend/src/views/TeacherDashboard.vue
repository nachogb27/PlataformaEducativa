<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1>Panel de Profesor</h1>
          <p class="welcome-text">Gestiona tus estudiantes</p>
        </div>
        <div class="header-actions">
          <button @click="logout" class="logout-button" title="Cerrar sesión">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.45 21 3.98 20.8 3.59 20.41C3.2 20.02 3 19.55 3 19V5C3 4.45 3.2 3.98 3.59 3.59C3.98 3.2 4.45 3 5 3H9V5H5V19H9V21ZM16 17L21 12L16 7V10H10V14H16V17Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-header">
        <h2>Mis Estudiantes</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{{ students.length }}</div>
            <div class="stat-label">Estudiantes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ uniqueSubjects }}</div>
            <div class="stat-label">Asignaturas</div>
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando estudiantes...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="table-container">
        <table class="students-table">
          <thead>
            <tr>
              <th>Nombre del alumno</th>
              <th>Apellidos del alumno</th>
              <th>Email del alumno</th>
              <th>Nombre de la asignatura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>
                <div class="student-cell">
                  <div class="student-avatar">{{ student.name.charAt(0) }}</div>
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
                    title="Editar estudiante"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    @click="deleteStudent(student)" 
                    class="action-button delete-button"
                    title="Eliminar estudiante"
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
    </div>

    <!-- Modal de edición -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Editar Estudiante</h3>
          <button @click="closeEditModal" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveStudent" class="edit-form">
          <div class="form-group">
            <label for="editName">Nombre:</label>
            <input 
              type="text" 
              id="editName" 
              v-model="editingStudent.name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="editSurnames">Apellidos:</label>
            <input 
              type="text" 
              id="editSurnames" 
              v-model="editingStudent.surnames"
              required
            />
          </div>
          
          <div v-if="editError" class="error-message">
            {{ editError }}
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="cancel-button">
              Cancelar
            </button>
            <button type="submit" class="save-button" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
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

export default {
  name: 'TeacherDashboard',
  data() {
    return {
      students: [],
      loading: true,
      error: null,
      showEditModal: false,
      editingStudent: {
        id: null,
        name: '',
        surnames: ''
      },
      editError: '',
      saving: false
    }
  },
  async mounted() {
    await this.loadStudents()
  },
  computed: {
    uniqueSubjects() {
      const subjects = new Set(this.students.map(s => s.subject))
      return subjects.size
    }
  },
  methods: {
    async loadStudents() {
      try {
        this.students = await dataService.getTeacherStudents()
      } catch (error) {
        this.error = error.message
        console.error('Error cargando estudiantes:', error)
      } finally {
        this.loading = false
      }
    },
    async logout() {
      try {
        await authService.logout()
        this.$router.push('/login')
      } catch (error) {
        console.error('Error en logout:', error)
        this.$router.push('/login')
      }
    },
    editStudent(student) {
      this.editingStudent = {
        id: student.id,
        name: student.name,
        surnames: student.lastName
      }
      this.showEditModal = true
      this.editError = ''
    },
    
    closeEditModal() {
      this.showEditModal = false
      this.editingStudent = {
        id: null,
        name: '',
        surnames: ''
      }
      this.editError = ''
    },
    
    async saveStudent() {
      this.saving = true
      this.editError = ''
      
      try {
        await dataService.editStudent(this.editingStudent.id, {
          name: this.editingStudent.name,
          surnames: this.editingStudent.surnames
        })
        
        // Actualizar la lista local
        const studentIndex = this.students.findIndex(s => s.id === this.editingStudent.id)
        if (studentIndex !== -1) {
          this.students[studentIndex].name = this.editingStudent.name
          this.students[studentIndex].lastName = this.editingStudent.surnames
        }
        
        this.closeEditModal()
      } catch (error) {
        this.editError = error.message || 'Error al guardar los cambios'
      } finally {
        this.saving = false
      }
    },
    
    async deleteStudent(student) {
      if (confirm(`¿Estás seguro de que deseas eliminar a ${student.name} ${student.lastName} de tu lista?`)) {
        try {
          await dataService.deleteStudent(student.id)
          
          // Eliminar de la lista local
          this.students = this.students.filter(s => s.id !== student.id)
          
          alert(`${student.name} ${student.lastName} ha sido eliminado de tu lista`)
        } catch (error) {
          alert('Error al eliminar el estudiante: ' + error.message)
        }
      }
    }
  }
}
</script>

<style scoped>
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

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}

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

.stats {
  display: flex;
  gap: 16px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  min-width: 100px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  color: #718096;
  font-size: 14px;
  font-weight: 500;
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
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin: 40px 0;
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

.student-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
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

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
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
</style>