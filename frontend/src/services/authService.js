// services/authService.js

const API_URL = 'http://localhost:3000/api';

const authService = {
  // Login del usuario
  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en el login');
      }

      const data = await response.json();
      
      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Token guardado:', data.token);
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registro de usuario
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error en el registro');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en register:', error);
      throw error;
    }
  },

  // Solicitud de recuperación de contraseña
  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al solicitar recuperación');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      throw error;
    }
  },

  // Restablecer contraseña
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al restablecer contraseña');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en resetPassword:', error);
      throw error;
    }
  },

  // Logout del usuario
  async logout() {
    try {
      const token = this.getToken();
      
      if (token) {
        // Intentar cerrar sesión en el servidor
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error en logout del servidor:', error);
      // Continúa con el logout local aunque falle en el servidor
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Logout completado - Token eliminado');
    }
  },

  // Obtener el token del localStorage
  getToken() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('🔑 No hay token en localStorage');
        return null;
      }

      // Verificar que el token tenga el formato correcto (JWT)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ Token mal formado, limpiando localStorage');
        this.logout(); // Limpiar token corrupto
        return null;
      }

      console.log('🔑 Token válido encontrado');
      return token;
    } catch (error) {
      console.error('❌ Error obteniendo token:', error);
      this.logout(); // Limpiar en caso de error
      return null;
    }
  },

  // Obtener los datos del usuario del localStorage
 getUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error obteniendo usuario de localStorage:', error);
      return null;
    }
  },

   setUser(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ Usuario actualizado en localStorage:', userData);
    } catch (error) {
      console.error('❌ Error guardando usuario en localStorage:', error);
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getToken();
    const isAuth = !!token;
    console.log('🔒 Usuario autenticado:', isAuth);
    return isAuth;
  },

  // Obtener el rol del usuario
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },

  // Verificar si el token ha expirado (básico)
  isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        console.log('⏰ Token expirado');
        this.logout(); // Logout automático si el token expiró
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true;
    }
  },

  // Actualizar datos del usuario en localStorage
  updateUser(userData) {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('✅ Datos de usuario actualizados');
    } catch (error) {
      console.error('Error actualizando datos de usuario:', error);
    }
  },

   updateUserData(updates) {
    try {
      const currentUser = this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        this.setUser(updatedUser);
        return updatedUser;
      }
      return null;
    } catch (error) {
      console.error('❌ Error actualizando datos del usuario:', error);
      return null;
    }
  },

  // Limpiar completamente la autenticación (útil para debugging)
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Autenticación limpiada completamente');
  },

  // Debug: Mostrar información del token
  debugToken() {
    const token = localStorage.getItem('token');
    console.log('🔍 DEBUG TOKEN:');
    console.log('Token en localStorage:', token);
    
    if (token) {
      try {
        const parts = token.split('.');
        console.log('Partes del token:', parts.length);
        
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('Payload del token:', payload);
          console.log('Expira en:', new Date(payload.exp * 1000));
        }
      } catch (error) {
        console.error('Error decodificando token:', error);
      }
    }
  }
};

export default authService;