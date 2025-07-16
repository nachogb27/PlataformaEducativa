<template>
  <div class="register-container">
    <div class="register-card">
      <h2>Registrarse</h2>
      
      <form @submit.prevent="register" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Nombre:</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="surnames">Apellidos:</label>
            <input 
              type="text" 
              id="surnames" 
              v-model="form.surnames"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Nombre de usuario:</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">📧 Email:</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email"
            :class="{ 'error': emailError }"
            required
          />
          <div v-if="emailError" class="field-error">{{ emailError }}</div>
        </div>

        <div class="form-group">
          <label for="role">👨‍🏫 Rol:</label>
          <select id="role" v-model="form.role" required>
            <option value="">Selecciona un rol</option>
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor</option>
          </select>
        </div>

        <div v-if="form.role === 'teacher'" class="form-group">
          <label for="teacherToken">Token de profesor:</label>
          <input 
            type="text" 
            id="teacherToken" 
            v-model="form.teacherToken"
            placeholder="Ingresa el token de validación"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="password">🔑 Contraseña:</label>
            <input 
              type="password" 
              id="password" 
              v-model="form.password"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">🔑 Repetir contraseña:</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="form.confirmPassword"
              :class="{ 'error': passwordError }"
              required
            />
            <div v-if="passwordError" class="field-error">{{ passwordError }}</div>
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <button type="submit" class="register-button" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      
      <router-link to="/login" class="back-button">
        Volver al Login
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        name: '',
        surnames: '',
        username: '',
        email: '',
        role: '',
        password: '',
        confirmPassword: '',
        teacherToken: ''
      },
      emailError: '',
      passwordError: '',
      errorMessage: '',
      successMessage: '',
      loading: false
    }
  },
  watch: {
    'form.email'() {
      this.validateEmail();
    },
    'form.confirmPassword'() {
      this.validatePassword();
    },
    'form.password'() {
      this.validatePassword();
    }
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      this.emailError = '';
      if (this.form.email && !emailRegex.test(this.form.email)) {
        this.emailError = 'Por favor ingresa un email válido';
      }
    },
    
    validatePassword() {
      this.passwordError = '';
      if (this.form.confirmPassword && this.form.password !== this.form.confirmPassword) {
        this.passwordError = 'Las contraseñas no coinciden';
      }
    },
    
    async register() {
      this.errorMessage = '';
      this.successMessage = '';
      
      // Validaciones finales
      this.validateEmail();
      this.validatePassword();
      
      if (this.emailError || this.passwordError) {
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.form),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.successMessage = data.message;
          // Limpiar formulario
          this.form = {
            name: '',
            surnames: '',
            username: '',
            email: '',
            role: '',
            password: '',
            confirmPassword: '',
            teacherToken: ''
          };
        } else {
          this.errorMessage = data.error || 'Error en el registro';
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
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px 0;
}

.register-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 48px;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.register-card h2 {
  text-align: center;
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-form {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #4a5568;
  font-weight: 600;
  font-size: 14px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
}

.form-group input:focus,
.form-group select:focus {
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
  text-align: center;
  font-weight: 500;
}

.success-message {
  color: #48bb78;
  background: rgba(104, 211, 145, 0.1);
  border: 1px solid rgba(104, 211, 145, 0.3);
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.back-button {
  display: block;
  text-align: center;
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

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .register-card {
    padding: 32px 24px;
  }
}
</style>