<template>
  <div class="activate-container">
      <div class="lang-switcher-wrapper">
        <LanguageSwitcher />
      </div>
    <div class="activate-card">
      <div v-if="loading" class="loading-section">
        <div class="spinner"></div>
        <h2>{{ $t('ActivateAccountView.activating') }}</h2>
      </div>
      
      <div v-else-if="success" class="success-section">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#48bb78"/>
          </svg>
        </div>
        <h2>{{ $t('ActivateAccountView.success') }}</h2>
        <p>{{ $t('ActivateAccountView.successDesc') }}</p>
        <router-link to="/login" class="login-button">
          {{ $t('ActivateAccountView.backToLogin') }}
        </router-link>
      </div>
      
      <div v-else class="error-section">
        <div class="error-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#e53e3e"/>
          </svg>
        </div>
        <h2>{{ $t('ActivateAccountView.error') }}</h2>
        <p>{{ errorMessage }}</p>
        <router-link to="/login" class="back-button">
          {{ $t('ActivateAccountView.backToLogin') }}
        </router-link>
      </div>
    </div>
    <LanguageSwitcher />
  </div>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'ActivateAccountView',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      loading: true,
      success: false,
      errorMessage: ''
    }
  },
  async mounted() {
    const token = this.$route.query.token;
    if (!token) {
      this.loading = false;
      this.errorMessage = 'Token de activación no válido';
      return;
    }
    
    await this.activateAccount(token);
  },
  methods: {
    async activateAccount(token) {
      try {
        const response = await fetch('http://localhost:3000/api/activate-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.success = true;
        } else {
          this.errorMessage = data.error || 'Error al activar la cuenta';
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
.activate-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
}

.activate-card {
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

.loading-section h2 {
  color: #4a5568;
  margin-top: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-section h2 {
  color: #48bb78;
  font-size: 28px;
  margin: 20px 0 10px 0;
}

.error-section h2 {
  color: #e53e3e;
  font-size: 28px;
  margin: 20px 0 10px 0;
}

.success-section p,
.error-section p {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 30px;
}

.login-button,
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
}

.login-button:hover,
.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  text-decoration: none;
  color: white;
}
</style>