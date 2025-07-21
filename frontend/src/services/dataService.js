// services/dataService.js

import authService from './authService'

const API_URL = 'http://localhost:3000/api';

const dataService = {
  // ============= MÉTODOS EXISTENTES (SIN CAMBIOS) =============
  
  // Obtener profesores del estudiante
  async getStudentTeachers() {
    try {
      const response = await fetch(`${API_URL}/student/teachers`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo profesores');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getStudentTeachers:', error);
      throw error;
    }
  },

  // Obtener estudiantes del profesor
  async getTeacherStudents() {
    try {
      const response = await fetch(`${API_URL}/teacher/students`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo estudiantes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getTeacherStudents:', error);
      throw error;
    }
  },

  // Eliminar estudiante (profesor)
  async deleteStudent(studentId) {
    try {
      const response = await fetch(`${API_URL}/teacher/student/${studentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteStudent:', error);
      throw error;
    }
  },

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getProfile:', error);
      throw error;
    }
  },

  // Actualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar perfil');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateProfile:', error);
      throw error;
    }
  },

  // Actualizar avatar
  async updateAvatar(imageData) {
    try {
      const response = await fetch(`${API_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(imageData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar avatar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateAvatar:', error);
      throw error;
    }
  },

  // ============= MÉTODOS DE ASIGNATURAS =============

  // Obtener estudiantes asignados a una asignatura específica (profesor)
  async getAssignedStudents(subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/subject/${subjectId}/students`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo estudiantes asignados');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAssignedStudents:', error);
      throw error;
    }
  },

  // Obtener estudiantes disponibles para asignar a una asignatura (profesor)
  async getAvailableStudents(subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/subject/${subjectId}/available-students`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo estudiantes disponibles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAvailableStudents:', error);
      throw error;
    }
  },

  // Asignar estudiante a asignatura (profesor)
  async assignStudentToSubject(studentId, subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/assign-student`, {
        method: 'POST',
        headers: {  
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          subjectId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al asignar estudiante a la asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en assignStudentToSubject:', error);
      throw error;
    }
  },

  // Desasignar estudiante de asignatura (profesor)
  async removeStudentFromSubject(studentId, subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/remove-student`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId,
          subjectId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al quitar estudiante de la asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en removeStudentFromSubject:', error);
      throw error;
    }
  },

  // Obtener asignaturas del estudiante (las que está cursando)
  async getStudentSubjects() {
    try {
      const response = await fetch(`${API_URL}/student/subjects`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo asignaturas del estudiante');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getStudentSubjects:', error);
      throw error;
    }
  },

  // Obtener asignaturas del profesor
  async getTeacherSubjects() {
    try {
      const response = await fetch(`${API_URL}/teacher/subjects`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo asignaturas del profesor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getTeacherSubjects:', error);
      throw error;
    }
  },

  // Crear nueva asignatura (solo profesores)
  async createSubject(subjectName) {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: subjectName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear la asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createSubject:', error);
      throw error;
    }
  },

  // Actualizar asignatura (solo profesores)
  async updateSubject(subjectId, subjectName) {
    try {
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: subjectName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar la asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateSubject:', error);
      throw error;
    }
  },

  // Eliminar asignatura (solo profesores)
  async deleteSubject(subjectId) {
    try {
      const response = await fetch(`${API_URL}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar la asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteSubject:', error);
      throw error;
    }
  },

  // Desasignar profesor de asignatura
  async removeTeacherFromSubject(subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/remove-from-subject`, {
        method: 'POST',
        headers: {  
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al desasignar profesor de asignatura');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en removeTeacherFromSubject:', error);
      throw error;
    }
  },

  // Obtener todas las asignaturas del sistema
  async getAllSubjects() {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo todas las asignaturas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllSubjects:', error);
      throw error;
    }
  },

  // Unirse como profesor a una asignatura
  async joinAsTeacher(subjectId) {
    try {
      const response = await fetch(`${API_URL}/teacher/join-subject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al unirse como profesor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en joinAsTeacher:', error);
      throw error;
    }
  },

  // Obtener asignaturas detalladas del profesor (con estudiantes)
  async getTeacherSubjectsDetailed() {
    try {
      const response = await fetch(`${API_URL}/teacher/subjects-detailed`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error obteniendo asignaturas detalladas del profesor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getTeacherSubjectsDetailed:', error);
      throw error;
    }
  }
};

export default dataService;