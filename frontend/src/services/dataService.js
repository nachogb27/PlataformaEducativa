import authService from './authService';

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

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    
    return response.json();
  }

  async getStudentSubjects() {
    return this.fetchWithAuth(`${API_BASE_URL}/student/subjects`);
  }

  async getTeacherStudents() {
    return this.fetchWithAuth(`${API_BASE_URL}/teacher/students`);
  }
}

export default new DataService();