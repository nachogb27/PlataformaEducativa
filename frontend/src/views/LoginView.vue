<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Iniciar Sesión</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">NOMBRE DE USUARIO:</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username"
            placeholder="Ingresa tu nombre de usuario"
            required
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">CONTRASEÑA:</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password"
            placeholder="Ingresa tu contraseña"
            required
            :disabled="loading"
          />
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <button 
          type="submit" 
          class="login-button"
          :disabled="loading"
        >
          {{ loading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN' }}
        </button>
      </form>
      
      <div class="login-links">
        <router-link to="/forgot-password" class="link">
          Did you forget your password?
        </router-link>
        <router-link to="/register" class="link">
          Sign up
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      loading: false,
      error: '',
      successMessage: ''
    }
  },
  mounted() {
    // Verificar si hay un mensaje de activación exitosa
    if (this.$route.query.activated === 'true') {
      this.successMessage = 'Cuenta activada exitosamente. Ya puedes iniciar sesión.'
    }
    
    // Si ya está autenticado, redirigir
    if (authService.isAuthenticated()) {
      this.redirectToDashboard()
    }
  },
  methods: {
    async handleLogin() {
      // Limpiar mensajes anteriores
      this.error = ''
      this.successMessage = ''
      
      // Validaciones básicas
      if (!this.form.username.trim()) {
        this.error = 'El nombre de usuario es requerido'
        return
      }
      
      if (!this.form.password.trim()) {
        this.error = 'La contraseña es requerida'
        return
      }
      
      this.loading = true
      
      try {
        console.log('🔄 Intentando login con:', {
          username: this.form.username,
          password: '***'
        })
        
        // Llamar al servicio de autenticación
        const response = await authService.login({
          username: this.form.username.trim(),
          password: this.form.password
        })
        
        console.log('✅ Login exitoso:', response)
        
        // Redirigir al dashboard correspondiente
        this.redirectToDashboard(response.user.role)
        
      } catch (error) {
        console.error('❌ Error en login:', error)
        this.error = error.message || 'Error al iniciar sesión'
      } finally {
        this.loading = false
      }
    },
    
    redirectToDashboard(userRole = null) {
      try {
        // Si no se proporciona el rol, obtenerlo del servicio
        const role = userRole || authService.getUserRole()
        
        console.log('🔄 Redirigiendo usuario con rol:', role)
        
        if (role === 'teacher') {
          this.$router.push('/teacher-dashboard')
        } else if (role === 'student') {
          this.$router.push('/student-dashboard')
        } else {
          console.error('Rol desconocido:', role)
          this.error = 'Rol de usuario no válido'
        }
      } catch (error) {
        console.error('Error en redirección:', error)
        this.error = 'Error al redirigir al dashboard'
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

h1 {
  color: #2d3748;
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.success-message {
  color: #38a169;
  background: rgba(154, 230, 180, 0.2);
  border: 1px solid rgba(154, 230, 180, 0.5);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.login-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 8px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.login-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  text-align: center;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
    margin: 16px;
  }
  
  h1 {
    font-size: 24px;
  }
}
</style>