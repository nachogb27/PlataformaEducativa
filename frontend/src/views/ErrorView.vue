<template>
  <div class="error-container">
    <div class="error-card">
      <div class="error-illustration">
        <div class="error-icon">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="url(#errorGradient)" stroke-width="2"/>
            <path d="M15 9L9 15M9 9L15 15" stroke="url(#errorGradient)" stroke-width="2" stroke-linecap="round"/>
            <defs>
              <linearGradient id="errorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#ff6b6b"/>
                <stop offset="100%" style="stop-color:#ee5a52"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div class="error-code">ERROR {{ errorCode || '500' }}</div>
      </div>
      
      <div class="error-content">
        <h1>¡Algo salió mal!</h1>
        <p class="error-message">
          {{ errorMessage || 'Se produjo un error inesperado en el servidor.' }}
        </p>
        <p class="error-description">
          Nuestro equipo técnico ha sido notificado y está trabajando para solucionarlo.
        </p>
        
        <div class="error-details" v-if="showDetails">
          <div class="detail-item">
            <strong>Código de Error:</strong> 
            <span class="error-badge">{{ errorCode || 'UNKNOWN' }}</span>
          </div>
          
          <div class="detail-item" v-if="errorType">
            <strong>Tipo:</strong> 
            <span>{{ errorType }}</span>
          </div>
          
          <div class="detail-item" v-if="timestamp">
            <strong>Momento:</strong> 
            <span>{{ formatTimestamp(timestamp) }}</span>
          </div>
          
          <div class="detail-item" v-if="$route.path">
            <strong>Ruta:</strong> 
            <code>{{ $route.path }}</code>
          </div>
        </div>
        
        <div class="action-buttons">
          <button @click="goHome" class="home-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Ir al Inicio
          </button>
          
          <button @click="retry" class="retry-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4V10H7M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.49 9C19.9828 7.56678 19.1209 6.28825 17.9845 5.27455C16.8482 4.26085 15.4745 3.54684 13.9917 3.19434C12.5089 2.84183 10.9652 2.86144 9.49079 3.25141C8.01639 3.64138 6.66375 4.38991 5.55 5.43L1 10M23 14L18.45 18.57C17.3362 19.6101 15.9836 20.3586 14.5092 20.7486C13.0348 21.1386 11.4911 21.1582 10.0083 20.8057C8.52547 20.4532 7.1518 19.7392 6.01547 18.7255C4.87913 17.7117 4.01719 16.4332 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Reintentar
          </button>
          
          <button @click="toggleDetails" class="details-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="19" cy="12" r="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="5" cy="12" r="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ showDetails ? 'Ocultar' : 'Ver' }} Detalles
          </button>
        </div>
        
        <div class="help-section">
          <h3>¿Necesitas ayuda?</h3>
          <div class="help-options">
            <button @click="reportError" class="help-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Reportar Error
            </button>
            
            <router-link to="/login" class="help-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.45 21 3.98 20.8 3.59 20.41C3.2 20.02 3 19.55 3 19V5C3 4.45 3.2 3.98 3.59 3.59C3.98 3.2 4.45 3 5 3H9V5H5V19H9V21ZM16 17L21 12L16 7V10H10V14H16V17Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Iniciar Sesión
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ErrorView',
  data() {
    return {
      showDetails: false,
      timestamp: new Date()
    }
  },
  computed: {
    errorCode() {
      return this.$route.query.code || this.$route.params.code || '500';
    },
    
    errorMessage() {
      const messages = {
        '400': 'Solicitud incorrecta. Los datos enviados no son válidos.',
        '401': 'No autorizado. Necesitas iniciar sesión.',
        '403': 'Acceso prohibido. No tienes permisos para esta acción.',
        '404': 'Recurso no encontrado.',
        '422': 'Los datos enviados no se pudieron procesar.',
        '500': 'Error interno del servidor.',
        '502': 'El servidor no está disponible temporalmente.',
        '503': 'Servicio no disponible. Intenta más tarde.'
      };
      
      return this.$route.query.message || 
             messages[this.errorCode] || 
             'Se produjo un error inesperado.';
    },
    
    errorType() {
      const types = {
        '400': 'Error de Cliente',
        '401': 'Error de Autenticación',
        '403': 'Error de Autorización',
        '404': 'Recurso No Encontrado',
        '422': 'Error de Validación',
        '500': 'Error de Servidor',
        '502': 'Error de Gateway',
        '503': 'Servicio No Disponible'
      };
      
      return types[this.errorCode] || 'Error Desconocido';
    }
  },
  methods: {
    goHome() {
      this.$router.push('/');
    },
    
    retry() {
      // Recargar la página actual
      window.location.reload();
    },
    
    toggleDetails() {
      this.showDetails = !this.showDetails;
    },
    
    reportError() {
      // Aquí podrías implementar un sistema de reporte de errores
      const errorInfo = {
        code: this.errorCode,
        message: this.errorMessage,
        route: this.$route.path,
        timestamp: this.timestamp,
        userAgent: navigator.userAgent
      };
      
      console.log('Error Report:', errorInfo);
      alert('Error reportado. Nuestro equipo técnico ha sido notificado.');
    },
    
    formatTimestamp(date) {
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
}

.error-card {
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
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.error-icon svg {
  filter: drop-shadow(0 4px 20px rgba(255, 107, 107, 0.3));
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.error-code {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 16px;
}

.error-content h1 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 16px;
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

.error-details {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin: 24px 0;
  text-align: left;
}

.detail-item {
  margin-bottom: 12px;
  color: #4a5568;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.error-badge {
  background: #fed7d7;
  color: #c53030;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.detail-item code {
  background: #e2e8f0;
  color: #2d3748;
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'Courier New', monospace;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 32px 0;
  flex-wrap: wrap;
}

.home-button,
.retry-button,
.details-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.home-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.retry-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(72, 187, 120, 0.3);
}

.details-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.details-button:hover {
  background: #edf2f7;
  transform: translateY(-1px);
}

.help-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.help-section h3 {
  color: #2d3748;
  font-size: 18px;
  margin-bottom: 16px;
}

.help-options {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 14px;
  cursor: pointer;
}

.help-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  text-decoration: none;
}

@media (max-width: 768px) {
  .error-card {
    padding: 32px 24px;
  }
  
  .error-content h1 {
    font-size: 24px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .home-button,
  .retry-button,
  .details-button {
    width: 100%;
    max-width: 240px;
  }
  
  .help-options {
    flex-direction: column;
  }
  
  .help-link {
    width: 100%;
    justify-content: center;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>