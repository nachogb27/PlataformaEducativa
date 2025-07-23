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

      <!-- Google Sign-In con método de redirección -->
      <div class="google-signin-container">
        <div class="divider">
          <span>O continúa con</span>
        </div>
        
        <!-- Botón personalizado para redirección -->
        <button 
          @click="redirectToGoogle"
          class="google-signin-redirect"
          :disabled="loading"
          type="button"
        >
          <svg class="google-icon" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Iniciar sesión con Google
        </button>
        
        <!-- Botón original oculto para comparar -->
        <div style="display: none;">
          <g-signin-button
            :params="googleSignInParams"
            @success="handleSignInSuccess"
            @error="handleSignInFailure"
          >
          </g-signin-button>
        </div>
      </div>

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
      successMessage: '',
      googleSignInParams: {
        client_id: '293433328847-sggs3n9rc06i95i2g7lqcg45v2qtgpmh.apps.googleusercontent.com',
        scope: 'profile email',
        longtitle: true,
        theme: 'light'
      }
    }
  },
  mounted() {
    if (this.$route.query.activated === 'true') {
      this.successMessage = 'Cuenta activada exitosamente. Ya puedes iniciar sesión.'
    }

    if (authService.isAuthenticated()) {
      this.redirectToDashboard()
    }

    // Verificar si venimos de Google OAuth redirect
    this.handleGoogleCallback()
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.successMessage = ''

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
        const response = await authService.login({
          username: this.form.username.trim(),
          password: this.form.password
        })

        this.redirectToDashboard(response.user.role)

      } catch (error) {
        this.error = error.message || 'Error al iniciar sesión'
      } finally {
        this.loading = false
      }
    },

    redirectToDashboard(userRole = null) {
      try {
        const role = userRole || authService.getUserRole()

        if (role === 'teacher') {
          this.$router.push('/teacher-dashboard')
        } else if (role === 'student') {
          this.$router.push('/student-dashboard')
        } else {
          this.error = 'Rol de usuario no válido'
        }
      } catch (error) {
        this.error = 'Error al redirigir al dashboard'
      }
    },

    // Método de redirección directa a Google (sin popup)
    redirectToGoogle() {
      console.log('🚀 Redirigiendo a Google OAuth...')
      
      const clientId = '293433328847-sggs3n9rc06i95i2g7lqcg45v2qtgpmh.apps.googleusercontent.com'
      const redirectUri = encodeURIComponent(window.location.origin + '/login')
      const scope = encodeURIComponent('profile email')
      const responseType = 'code'
      const state = Math.random().toString(36).substring(7)
      
      // Guardar state para verificación
      localStorage.setItem('google_oauth_state', state)
      
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=${responseType}&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `access_type=offline&` +
        `prompt=select_account`
      
      console.log('🔗 URL de Google:', googleAuthUrl)
      
      // Redireccionar a Google
      window.location.href = googleAuthUrl
    },

    // Manejar callback de Google
    async handleGoogleCallback() {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')
      
      if (error) {
        console.error('❌ Error de Google OAuth:', error)
        this.error = 'Error en la autenticación con Google'
        return
      }
      
      if (code && state) {
        console.log('📝 Código de autorización recibido:', code.substring(0, 20) + '...')
        
        // Verificar state
        const savedState = localStorage.getItem('google_oauth_state')
        if (state !== savedState) {
          console.error('❌ State no válido')
          this.error = 'Error de seguridad en la autenticación'
          return
        }
        
        try {
          this.loading = true
          
          // Enviar código al backend
          console.log('📤 Enviando código al backend...')
          
          const response = await authService.loginWithGoogleCode(code)
          
          console.log('✅ Login exitoso:', response)
          
          this.successMessage = 'Iniciando sesión con Google...'
          
          // Limpiar URL
          window.history.replaceState({}, document.title, '/login')
          
          setTimeout(() => {
            this.redirectToDashboard(response.user.role)
          }, 1000)
          
        } catch (error) {
          console.error('❌ Error procesando código:', error)
          this.error = 'Error al procesar la autenticación con Google'
        } finally {
          this.loading = false
          localStorage.removeItem('google_oauth_state')
        }
      }
    },

    // Mantener método original para el botón oculto
    async handleSignInSuccess(googleUser) {
      console.log('🎯 Google Sign-In Success (método original):', googleUser)
      
      try {
        this.loading = true
        this.error = ''
        
        const idToken = googleUser.getAuthResponse().id_token
        console.log('🔑 ID Token obtenido:', idToken.substring(0, 50) + '...')
        
        const response = await authService.loginWithGoogle(idToken)
        console.log('✅ Respuesta del backend:', response)
        
        this.successMessage = 'Iniciando sesión con Google...'
        setTimeout(() => {
          this.redirectToDashboard(response.user.role)
        }, 1000)
        
      } catch (error) {
        console.error('❌ Error en Google Sign-In:', error)
        this.error = 'Error al iniciar sesión con Google: ' + (error.message || 'Error desconocido')
      } finally {
        this.loading = false
      }
    },

    handleSignInFailure(error) {
      console.error('❌ Google Sign-In error:', error)
      this.error = 'Error con el inicio de sesión de Google.'
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

/* Estilos para Google Sign-In */
.google-signin-container {
  margin-top: 24px;
}

.divider {
  text-align: center;
  position: relative;
  margin: 20px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: rgba(255, 255, 255, 0.95);
  padding: 0 15px;
  color: #718096;
  font-size: 14px;
  position: relative;
}

/* Botón de redirección personalizado */
.google-signin-redirect {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 16px 0;
}

.google-signin-redirect:hover:not(:disabled) {
  border-color: #667eea;
  background: #f7fafc;
  transform: translateY(-1px);
}

.google-signin-redirect:disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
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