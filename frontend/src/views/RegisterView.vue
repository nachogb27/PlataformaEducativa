<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Registrarse</h2>
      <div class="content">
        <div class="icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21Z" fill="url(#gradient)"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea"/>
                <stop offset="100%" style="stop-color:#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p>¡Pronto podrás crear tu cuenta!</p>
        <p class="subtitle">Estamos trabajando en el formulario de registro</p>
        <router-link to="/login" class="back-button">
          Volver al Login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView'
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 420px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-card h2 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.icon svg {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}

.content p {
  color: #4a5568;
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.subtitle {
  color: #718096 !important;
  font-size: 14px !important;
  font-weight: 400 !important;
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
  margin-top: 12px;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
  text-decoration: none;
  color: white;
}
</style>