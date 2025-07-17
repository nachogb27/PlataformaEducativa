<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1>Panel de Estudiante</h1>
          <p class="welcome-text">Profesores de mis asignaturas</p>
        </div>
        <div class="header-actions">
          <button @click="goToProfile" class="profile-button" title="Mi Perfil">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
            </svg>
          </button>
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
        <h2>Mis Profesores</h2>
      </div>
      
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Cargando profesores...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-else class="table-container">
        <table class="teachers-table">
          <thead>
            <tr>
              <th>Nombre del profesor</th>
              <th>Apellidos del profesor</th>
              <th>Email del profesor</th>
              <th>Nombre de la asignatura</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in teachers" :key="`${teacher.teacherId}-${teacher.subjectId}`">
              <td>
                <div class="teacher-cell">
                  <div v-if="teacher.avatar" class="teacher-avatar-image">
                    <img :src="teacher.avatar" :alt="teacher.name" class="avatar-img" />
                  </div>
                  <div v-else class="teacher-avatar">{{ teacher.name.charAt(0) }}</div>
                  <span class="teacher-name">{{ teacher.name }}</span>
                </div>
              </td>
              <td>
                <span class="teacher-surname">{{ teacher.surnames }}</span>
              </td>
              <td>
                <span class="teacher-email">{{ teacher.email }}</span>
              </td>
              <td>
                <span class="subject-badge">{{ teacher.subjectName }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import dataService from '@/services/dataService'

export default {
  name: 'StudentDashboard',
  data() {
    return {
      teachers: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadTeachers()
  },
  computed: {
  },
  methods: {
    async loadTeachers() {
      try {
        this.teachers = await dataService.getStudentTeachers()
      } catch (error) {
        this.error = error.message
        console.error('Error cargando profesores:', error)
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
    goToProfile() {
      this.$router.push('/profile')
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

.profile-button,
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

.profile-button:hover::after,
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

.teachers-table {
  width: 100%;
  border-collapse: collapse;
}

.teachers-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.teachers-table td {
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.teachers-table tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.teacher-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacher-avatar,
.teacher-avatar-image {
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

.teacher-avatar {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.teacher-avatar-image {
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

.teacher-name {
  font-weight: 600;
  color: #2d3748;
}

.teacher-surname {
  color: #4a5568;
  font-weight: 500;
}

.teacher-email {
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
</style>