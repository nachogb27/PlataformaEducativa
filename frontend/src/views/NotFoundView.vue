<template>
  <div class="not-found-container">
        <div class="lang-switcher-wrapper">
          <LanguageSwitcher />
        </div>
    <div class="not-found-card">
      <div class="error-illustration">
        <div class="error-number">404</div>
        <div class="error-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="url(#gradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea"/>
                <stop offset="100%" style="stop-color:#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      <div class="error-content">
        <h1>¡Oops! {{ $t('NotFoundView.title') }}</h1>
        <p class="error-message">
          {{ $t('NotFoundView.message') }}
        </p>
        <p class="error-description">
          {{ $t('NotFoundView.description') }}
        </p>
        
        <div class="current-route">
          <strong>Ruta solicitada:</strong> 
          <code>{{ $route.path }}</code>
        </div>
        
        <div class="action-buttons">
          <button @click="goHome" class="home-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('NotFoundView.goHome') }}
          </button>
          
          <button @click="goBack" class="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('common.back') }}
          </button>
        </div>
      </div>
      
      <div class="helpful-links">
        <h3>{{ $t('NotFoundView.suggestions') }}</h3>
        <div class="links-grid">
          <router-link to="/login" class="help-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 17L15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('NotFoundView.login') }}
          <!-- removed duplicate closing tag -->
          
          <router-link to="/register" class="help-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 8V14M17 11H23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('NotFoundView.register') }}
          </router-link>
          
          <router-link to="/forgot-password" class="help-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ $t('NotFoundView.forgotPassword') }}
          </router-link>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'NotFoundView',
  components: {
    LanguageSwitcher
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    
    goBack() {

      if (window.history.length > 1) {
        this.$router.go(-1);
      } else {
        this.$router.push('/');
      }
    }
  }
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
  position: relative;
}

.not-found-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-illustration {
  margin-bottom: 32px;
  position: relative;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.error-icon svg {
  filter: drop-shadow(0 4px 20px rgba(102, 126, 234, 0.2));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.error-content h1 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-message {
  color: #4a5568;
  font-size: 18px;
  margin-bottom: 12px;
  font-weight: 500;
}

.error-description {
  color: #718096;
  font-size: 16px;
  margin-bottom: 24px;
}

.current-route {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  color: #4a5568;
  font-size: 14px;
}

.current-route code {
  background: #e53e3e;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 32px 0;
  flex-wrap: wrap;
}

.home-button,
.back-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  text-decoration: none;
}

.home-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.back-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.back-button:hover {
  background: #edf2f7;
  transform: translateY(-1px);
}

.helpful-links {
  margin-top: 40px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.helpful-links h3 {
  color: #2d3748;
  font-size: 18px;
  margin-bottom: 20px;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
}

.help-link:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transform: translateY(-1px);
  text-decoration: none;
}

@media (max-width: 768px) {
  .not-found-card {
    padding: 32px 24px;
  }
  
  .error-number {
    font-size: 80px;
  }
  
  .error-content h1 {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .home-button,
  .back-button {
    width: 100%;
    max-width: 240px;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
  .lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}
}
</style>