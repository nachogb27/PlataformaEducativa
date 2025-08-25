<template>
  <div class="reset-password-container">
      <div class="lang-switcher-wrapper">
      <LanguageSwitcher />
    </div>
    <div class="reset-password-card">
      <h2>{{ $t('ResetPasswordView.title') }}</h2>
      
      <div class="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.1 16 12.7V16.3C16 16.9 15.4 17.5 14.8 17.5H9.2C8.6 17.5 8 16.9 8 16.3V12.7C8 12.1 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7ZM12 8.2C11.2 8.2 10.4 8.8 10.4 10V11.5H13.6V10C13.6 8.8 12.8 8.2 12 8.2Z" fill="url(#gradient)"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea"/>
              <stop offset="100%" style="stop-color:#764ba2"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <p class="description">{{ $t('ResetPasswordView.description') }}</p>
      
      <form @submit.prevent="resetPassword" class="reset-form">
        <div class="form-group">
          <label for="newPassword">{{ $t('ResetPasswordView.newPassword') }}:</label>
          <input 
            type="password" 
            id="newPassword" 
            v-model="newPassword"
            :placeholder="$t('ResetPasswordView.newPassword')"
            required
            :class="{ 'error': passwordError }"
          />
          <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">{{ $t('ResetPasswordView.confirmPassword') }}:</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword"
            :placeholder="$t('ResetPasswordView.confirmPassword')"
            required
            :class="{ 'error': confirmError }"
          />
          <div v-if="confirmError" class="field-error">{{ confirmError }}</div>
        </div>
        
        <div class="password-requirements">
          <p>{{ $t('ResetPasswordView.requirements') }}</p>
          <ul>
            <li :class="{ 'valid': hasMinLength }">{{ $t('ResetPasswordView.minLength') }}</li>
            <li :class="{ 'valid': hasUppercase }">{{ $t('ResetPasswordView.uppercase') }}</li>
            <li :class="{ 'valid': hasLowercase }">{{ $t('ResetPasswordView.lowercase') }}</li>
            <li :class="{ 'valid': hasNumber }">{{ $t('ResetPasswordView.number') }}</li>
          </ul>
        </div>
        
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        
        <button type="submit" class="submit-button" :disabled="loading || !isFormValid">
          {{ loading ? $t('ResetPasswordView.resetting') : $t('ResetPasswordView.reset') }}
        </button>
      </form>
      
      <router-link to="/login" class="back-button">
        {{ $t('ResetPasswordView.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<script>

import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'ResetPasswordView',
    components: {
    LanguageSwitcher
  },
  data() {
    return {
      newPassword: '',
      confirmPassword: '',
      passwordError: '',
      confirmError: '',
      errorMessage: '',
      loading: false,
      token: ''
    }
  },
  computed: {
    hasMinLength() {
      return this.newPassword.length >= 8;
    },
    hasUppercase() {
      return /[A-Z]/.test(this.newPassword);
    },
    hasLowercase() {
      return /[a-z]/.test(this.newPassword);
    },
    hasNumber() {
      return /\d/.test(this.newPassword);
    },
    isPasswordValid() {
      return this.hasMinLength && this.hasUppercase && this.hasLowercase && this.hasNumber;
    },
    isFormValid() {
      return this.isPasswordValid && this.newPassword === this.confirmPassword && this.newPassword.length > 0;
    }
  },
  mounted() {
    this.token = this.$route.query.token;
    if (!this.token) {
      this.errorMessage = this.$t('ResetPasswordView.invalid');
    }
  },
  watch: {
    newPassword() {
      this.validatePassword();
    },
    confirmPassword() {
      this.validateConfirmPassword();
    }
  },
  methods: {
    validatePassword() {
      this.passwordError = '';
      if (this.newPassword.length > 0 && !this.isPasswordValid) {
        this.passwordError = this.$t('ResetPasswordView.invalid');
      }
    },
    
    validateConfirmPassword() {
      this.confirmError = '';
      if (this.confirmPassword.length > 0 && this.newPassword !== this.confirmPassword) {
        this.confirmError = this.$t('ResetPasswordView.invalid');
      }
    },
    
    async resetPassword() {
      this.passwordError = '';
      this.confirmError = '';
      this.errorMessage = '';
      
      if (!this.isPasswordValid) {
        this.passwordError = this.$t('ResetPasswordView.invalid');
        return;
      }
      
      if (this.newPassword !== this.confirmPassword) {
        this.confirmError = this.$t('ResetPasswordView.invalid');
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:3000/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.token,
            newPassword: this.newPassword,
            confirmPassword: this.confirmPassword
          }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.$router.push({ 
            name: 'Login', 
            query: { message: 'Contraseña actualizada exitosamente' }
          });
        } else {
          this.errorMessage = data.error || 'Error al restablecer la contraseña';
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
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.reset-password-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.reset-password-card h2 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.icon svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  margin-bottom: 20px;
}

.description {
  color: #4a5568;
  font-size: 16px;
  margin-bottom: 30px;
}

.reset-form {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
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

.password-requirements {
  background: #f7fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: left;
}

.password-requirements p {
  margin: 0 0 8px 0;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  padding: 4px 0;
  color: #e53e3e;
  font-size: 12px;
  position: relative;
  padding-left: 20px;
}

.password-requirements li::before {
  content: "✗";
  position: absolute;
  left: 0;
  color: #e53e3e;
}

.password-requirements li.valid {
  color: #48bb78;
}

.password-requirements li.valid::before {
  content: "✓";
  color: #48bb78;
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

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  text-decoration: none;
  color: white;
}

.lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}
</style>