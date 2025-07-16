<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1>Panel de Estudiante</h1>
          <p class="welcome-text">Bienvenido de vuelta</p>
        </div>
        <button @click="logout" class="logout-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.45 21 3.98 20.8 3.59 20.41C3.2 20.02 3 19.55 3 19V5C3 4.45 3.2 3.98 3.59 3.59C3.98 3.2 4.45 3 5 3H9V5H5V19H9V21ZM16 17L21 12L16 7V10H10V14H16V17Z" fill="currentColor"/>
          </svg>
          Cerrar Sesión
        </button>
      </div>
    </div>
    
    <div class="dashboard-content">
      <div class="content-header">
        <h2>Mis Asignaturas</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{{ subjects.length }}</div>
            <div class="stat-label">Asignaturas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ activeSubjects }}</div>
            <div class="stat-label">Activas</div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table class="subjects-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Profesor</th>
              <th>Créditos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id">
              <td>
                <div class="subject-cell">
                  <div class="subject-icon">📚</div>
                  <span class="subject-name">{{ subject.name }}</span>
                </div>
              </td>
              <td>
                <div class="teacher-cell">
                  <div class="teacher-avatar">{{ subject.teacher.charAt(0) }}</div>
                  <span>{{ subject.teacher }}</span>
                </div>
              </td>
              <td>
                <span class="credits-badge">{{ subject.credits }} créditos</span>
              </td>
              <td>
                <span class="status-badge cursando">
                  {{ subject.status }}
                </span>
              </td>
              <td>
                <button class="action-button">Ver Detalles</button>
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
      subjects: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadSubjects()
  },
  methods: {
    async loadSubjects() {
      try {
        this.subjects = await dataService.getStudentSubjects()
      } catch (error) {
        this.error = error.message
        console.error('Error cargando asignaturas:', error)
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
    }
  },
  computed: {
    activeSubjects() {
      return this.subjects.filter(s => s.status === 'Cursando').length
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

.logout-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 14px;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
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

.table-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.subjects-table {
  width: 100%;
  border-collapse: collapse;
}

.subjects-table th {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 20px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.subjects-table td {
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.subjects-table tr:hover {
  background: rgba(102, 126, 234, 0.05);
}

.subject-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.subject-icon {
  font-size: 20px;
}

.subject-name {
  font-weight: 600;
  color: #2d3748;
}

.teacher-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.teacher-avatar {
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

.credits-badge {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.cursando {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.action-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}
</style>