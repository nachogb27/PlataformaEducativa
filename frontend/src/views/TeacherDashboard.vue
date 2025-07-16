<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="welcome-section">
          <h1>Panel de Profesor</h1>
          <p class="welcome-text">Gestiona tus estudiantes</p>
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
        <h2>Mis Estudiantes</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{{ students.length }}</div>
            <div class="stat-label">Estudiantes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ averageGrade }}</div>
            <div class="stat-label">Promedio</div>
          </div>
        </div>
      </div>
      
      <div class="table-container">
        <table class="students-table">
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Email</th>
              <th>Asignatura</th>
              <th>Calificación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student.id">
              <td>
                <div class="student-cell">
                  <div class="student-avatar">{{ student.name.charAt(0) }}{{ student.lastName.charAt(0) }}</div>
                  <div class="student-info">
                    <span class="student-name">{{ student.name }} {{ student.lastName }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="email">{{ student.email }}</span>
              </td>
              <td>
                <span class="subject-badge">{{ student.subject }}</span>
              </td>
              <td>
                <span :class="['grade-badge', getGradeClass(student.grade)]">
                  {{ student.grade }}
                </span>
              </td>
              <td>
                <button class="action-button">Ver Perfil</button>
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
  name: 'TeacherDashboard',
  data() {
    return {
      students: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadStudents()
  },
  computed: {
    averageGrade() {
      if (this.students.length === 0) return '0.0'
      const total = this.students.reduce((sum, student) => sum + parseFloat(student.grade), 0)
      return (total / this.students.length).toFixed(1)
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
    getGradeClass(grade) {
      const gradeNum = parseFloat(grade)
      if (gradeNum >= 9) return 'excellent'
      if (gradeNum >= 8) return 'good'
      if (gradeNum >= 7) return 'average'
      return 'poor'
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
  width: 40px;
  height: 40px;
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

.email {
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

.grade-badge {
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  min-width: 40px;
  text-align: center;
}

.grade-badge.excellent {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.grade-badge.good {
  background: rgba(66, 153, 225, 0.1);
  color: #4299e1;
}

.grade-badge.average {
  background: rgba(237, 137, 54, 0.1);
  color: #ed8936;
}

.grade-badge.poor {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
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