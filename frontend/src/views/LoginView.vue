<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Iniciar Sesión</h2>
      
      <form @submit.prevent="login" class="login-form">
        <div class="form-group">
          <label for="username">Nombre de usuario:</label>
          <input 
            type="text" 
            id="username" 
            v-model="credentials.username"
            placeholder="Ingresa tu nombre de usuario"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input 
            type="password" 
            id="password" 
            v-model="credentials.password"
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
        </button>
      </form>
      
      <div class="links">
        <router-link to="/forgot-password" class="forgot-password">
          Did you forget your password?
        </router-link>
        
        <router-link to="/register" class="register-link">
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
      credentials: {
        username: '',
        password: ''
      },
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  mounted() {
    // Mostrar mensaje de éxito si viene de reset password
    if (this.$route.query.message) {
      this.successMessage = this.$route.query.message;
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.errorMessage = ''
      
      try {
        const result = await authService.login(this.credentials.username, this.credentials.password)
        
        // Redirigir según el rol
        if (result.user.role === 'student') {
          this.$router.push('/student-dashboard')
        } else if (result.user.role === 'teacher') {
          this.$router.push('/teacher-dashboard')
        }
      } catch (error) {
        this.errorMessage = error.message || 'Error al iniciar sesión. Inténtalo de nuevo.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-card h2 {
  text-align: center;
  margin-bottom: 36px;
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  color: #2d3748;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-group input::placeholder {
  color: #a0aec0;
}

.success-message {
  color: #48bb78;
  background: rgba(104, 211, 145, 0.1);
  border: 1px solid rgba(104, 211, 145, 0.3);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 500;
  backdrop-filter: blur(5px);
}

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 500;
  backdrop-filter: blur(5px);
}

.login-button {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.links {
  text-align: center;
  margin-top: 32px;
}

.links a {
  color: #667eea;
  text-decoration: none;
  margin: 0 12px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
}

.links a:hover {
  color: #764ba2;
  text-decoration: none;
}

.links a:hover::after {
  width: 100%;
}

.links a::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  width: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.forgot-password {
  display: block;
  margin-bottom: 16px;
  font-size: 14px;
}

.register-link {
  font-weight: 600;
  font-size: 16px;
}
</style>