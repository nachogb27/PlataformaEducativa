<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h2>Recuperar Contraseña</h2>
      
      <div v-if="!emailSent" class="form-section">
        <div class="icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" fill="url(#gradient)"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea"/>
                <stop offset="100%" style="stop-color:#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <p class="description">Ingresa tu email para recibir instrucciones de recuperación</p>
        
        <form @submit.prevent="sendResetEmail" class="forgot-form">
          <div class="form-group">
            <label for="email">Correo electrónico:</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="ejemplo@correo.com"
              required
              :class="{ 'error': emailError }"
            />
            <div v-if="emailError" class="field-error">{{ emailError }}</div>
          </div>
          
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          
          <button type="submit" class="submit-button" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar instrucciones' }}
          </button>
        </form>
      </div>
      
      <div v-else class="success-section">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#48bb78"/>
          </svg>
        </div>
        <h3>¡Email enviado!</h3>
        <p>Hemos enviado las instrucciones de recuperación a tu correo electrónico.</p>
      </div>
      
      <router-link to="/login" class="back-button">
        Volver al Login
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      emailError: '',
      errorMessage: '',
      loading: false,
      emailSent: false
    }
  },
  methods: {
    validateEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    
    async sendResetEmail() {
      this.emailError = '';
      this.errorMessage = '';
      
      // Validar email
      if (!this.validateEmail(this.email)) {
        this.emailError = 'Por favor ingresa un email válido';
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:3000/api/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: this.email }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.emailSent = true;
        } else {
          this.errorMessage = data.error || 'Error al enviar el email';
        }
      } catch (error) {
        this.errorMessage = 'Error de conexión. Inténtalo más tarde.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.forgot-password-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 480px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.forgot-password-card h2 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.icon svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.description {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 20px;
}

.forgot-form {
  width: 100%;
  max-width: 350px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #e53e3e;
}

.field-error {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 5px;
}

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-weight: 500;
}

.submit-button {
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
  margin-bottom: 20px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.submit-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.success-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.success-icon svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.success-section h3 {
  color: #48bb78;
  font-size: 24px;
  margin: 0;
}

.success-section p {
  color: #4a5568;
  font-size: 16px;
  margin: 0;
}

.back-button {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 20px;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  text-decoration: none;
  color: white;
}

</style>