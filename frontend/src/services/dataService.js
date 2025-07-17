import authService from './authService';
import router from '../router/index';

const API_BASE_URL = 'http://localhost:3000/api';

class DataService {
  async fetchWithAuth(url, options = {}) {
    const token = authService.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // 🆕 Manejo mejorado de errores con redirección
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        // Códigos de error específicos que requieren redirección a vista de error
        const errorCodes = [500, 502, 503, 422];
        
        if (errorCodes.includes(response.status)) {
          // Redirigir a la vista de error con información específica
          router.push({
            name: 'Error',
            params: { code: response.status },
            query: { 
              message: error.error || `Error ${response.status}`,
              timestamp: new Date().toISOString()
            }
          });
          return;
        }
        
        // Para otros errores, lanzar excepción normal
        throw new Error(error.error || `Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    } catch (fetchError) {
      // 🆕 Manejo de errores de red (sin conexión, timeout, etc.)
      if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
        router.push({
          name: 'Error',
          params: { code: '503' },
          query: { 
            message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
            type: 'network'
          }
        });
        return;
      }
      
      // Re-lanzar otros errores
      throw fetchError;
    }
  }

  async getStudentTeachers() {
    return this.fetchWithAuth(`${API_BASE_URL}/student/teachers`);
  }

  async getStudentSubjects() {
    return this.fetchWithAuth(`${API_BASE_URL}/student/subjects`);
  }

  async editStudent(studentId, studentData) {
    return this.fetchWithAuth(`${API_BASE_URL}/teacher/student/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(studentId) {
    return this.fetchWithAuth(`${API_BASE_URL}/teacher/student/${studentId}`, {
      method: 'DELETE'
    });
  }

  async getTeacherStudents() {
    return this.fetchWithAuth(`${API_BASE_URL}/teacher/students`);
  }

  // 🆕 Método para simular errores (útil para testing)
  simulateError(errorCode = 500) {
    router.push({
      name: 'Error',
      params: { code: errorCode },
      query: { 
        message: 'Error simulado para testing',
        type: 'simulation'
      }
    });
  }
}

export default new DataService();