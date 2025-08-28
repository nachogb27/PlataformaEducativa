<template>
  <div class="profile-container">
     <div class="lang-switcher-wrapper">
      <LanguageSwitcher />
    </div>
    <div class="profile-header">
      <div class="header-content">
        <h1>{{ $t('ProfileView.title') }}</h1>
        <button @click="goBack" class="back-button" :title="$t('ProfileView.back')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="profile-content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>{{ $t('ProfileView.loading') }}</p>
      </div>

      <div v-else-if="error" class="error-message">
        {{ $t('ProfileView.error') }}
      </div>

      <div v-else class="profile-layout">
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                v-if="profile.avatar" 
                :src="profile.avatar" 
                :alt="profile.name"
                class="avatar-image"
              />
              <div v-else class="avatar-placeholder">
                {{ profile.name.charAt(0) }}{{ profile.surnames.charAt(0) }}
              </div>
              
              <div v-if="uploadingAvatar" class="upload-overlay">
                <div class="upload-spinner"></div>
                <span class="upload-text">{{ $t('ProfileView.uploadingS3') }}</span>
              </div>

              <div class="avatar-actions">
                <button 
                  @click="triggerFileInput" 
                  class="change-avatar-button" 
                  :title="$t('ProfileView.changeAvatar')" 
                  :disabled="uploadingAvatar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1V3H9V1L3 7V9H21ZM21 10H3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V10Z" fill="currentColor"/>
                  </svg>
                </button>
                
                <button 
                  v-if="profile.avatar" 
                  @click="deleteAvatar" 
                  class="delete-avatar-button" 
                  :title="$t('ProfileView.deleteAvatar')" 
                  :disabled="uploadingAvatar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handleFileChange"
              style="display: none"
            />

            <div v-if="profile.avatar" class="avatar-info">
              <small class="avatar-source">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#f39c12"/>
                </svg>
                {{ $t('ProfileView.aws') }}
              </small>
            </div>
          </div>

          <div class="user-info">
            <h2>{{ profile.name }} {{ profile.surnames }}</h2>
            <div class="role-badge" :class="profile.role">
              {{ profile.role === 'teacher' ? $t('ProfileView.teacher') : $t('ProfileView.student') }}
            </div>
          </div>
        </div>

        <div class="info-card">
          <h3>{{ $t('ProfileView.info') }}</h3>
          
          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-row">
              <div class="form-group">
                <label>{{ $t('ProfileView.name') }}</label>
                <input 
                  type="text" 
                  v-model="editableProfile.name"
                  :disabled="!isEditing"
                  required
                />
              </div>
              
              <div class="form-group">
                <label>{{ $t('ProfileView.surnames') }}</label>
                <input 
                  type="text" 
                  v-model="editableProfile.surnames"
                  :disabled="!isEditing"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>{{ $t('ProfileView.email') }}</label>
              <input 
                type="email" 
                :value="profile.email"
                disabled
                class="readonly"
              />
              <small class="help-text">{{ $t('ProfileView.readonlyEmail') }}</small>
            </div>

            <div class="form-group">
              <label>{{ $t('ProfileView.username') }}</label>
              <input 
                type="text" 
                :value="profile.username"
                disabled
                class="readonly"
              />
              <small class="help-text">{{ $t('ProfileView.readonlyUsername') }}</small>
            </div>

            <div class="form-actions">
              <button 
                v-if="!isEditing"
                type="button" 
                @click="startEditing"
                class="edit-button"
              >
                {{ $t('ProfileView.edit') }}
              </button>
              
              <template v-else>
                <button 
                  type="button" 
                  @click="cancelEditing"
                  class="cancel-button"
                >
                  {{ $t('ProfileView.cancel') }}
                </button>
                <button 
                  type="submit" 
                  class="save-button"
                  :disabled="saving"
                >
                  {{ saving ? $t('ProfileView.saving') : $t('ProfileView.save') }}
                </button>
              </template>
            </div>
          </form>
        </div>

        <div v-if="profile.role === 'teacher' && profile.subjectStats" class="stats-card">
          <h3>{{ $t('ProfileView.subjects') }}</h3>
          
          <div class="stats-grid">
            <div class="stat-item" v-for="stat in profile.subjectStats" :key="stat.subjectName">
              <div class="stat-name">{{ stat.subjectName }}</div>
              <div class="stat-count">{{ stat.studentCount }} {{ $t('ProfileView.studentCount') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

export default {
  name: 'ProfileView',
  components: {
    LanguageSwitcher
  },
  data() {
    return {
      profile: {},
      editableProfile: {},
      loading: true,
      error: null,
      isEditing: false,
      saving: false,
      uploadingAvatar: false
    }
  },
  async mounted() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      try {
        const token = authService.getToken()
        const response = await fetch('http://localhost:3000/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Error al cargar el perfil')
        }

        this.profile = await response.json()
        this.editableProfile = {
          name: this.profile.name,
          surnames: this.profile.surnames
        }
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    startEditing() {
      this.isEditing = true
    },

    cancelEditing() {
      this.isEditing = false
      this.editableProfile = {
        name: this.profile.name,
        surnames: this.profile.surnames
      }
    },

    async updateProfile() {
      this.saving = true
      
      try {
        const token = authService.getToken()
        const response = await fetch('http://localhost:3000/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(this.editableProfile)
        })

        if (!response.ok) {
          throw new Error('Error al actualizar el perfil')
        }

        this.profile.name = this.editableProfile.name
        this.profile.surnames = this.editableProfile.surnames
        this.isEditing = false
        
        const currentUser = authService.getUser()
        currentUser.name = this.editableProfile.name
        currentUser.surnames = this.editableProfile.surnames
        authService.setUser(currentUser)
        
      } catch (error) {
        alert('Error al actualizar: ' + error.message)
      } finally {
        this.saving = false
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click()
    },

    async handleFileChange(event) {
      const file = event.target.files[0]
      if (!file) return

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten imágenes (JPEG, PNG, GIF)')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB')
        return
      }

      this.uploadingAvatar = true

      try {
        const formData = new FormData()
        formData.append('avatar', file)

        const token = authService.getToken()
        const response = await fetch('http://localhost:3000/api/profile/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al subir la imagen')
        }

        const result = await response.json()
        
        this.profile.avatar = result.avatarUrl
        
        const currentUser = authService.getUser()
        if (currentUser) {
          currentUser.avatar = result.avatarUrl
          authService.setUser(currentUser)
        }

        console.log('✅ Avatar subido exitosamente a S3:', result.avatarUrl)
        alert(this.$t('ProfileView.uploadComplete'))
        
      } catch (error) {
        console.error('❌ Error subiendo imagen:', error)
        alert('Error al subir imagen: ' + error.message)
      } finally {
        this.uploadingAvatar = false
        this.$refs.fileInput.value = ''
      }
    },

    async deleteAvatar() {
      if (!confirm(this.$t('ProfileView.deleteAvatarQuestion'))) {
        return
      }

      try {
        const token = authService.getToken()
        const response = await fetch('http://localhost:3000/api/profile/avatar', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al eliminar el avatar')
        }

        this.profile.avatar = null
        
        const currentUser = authService.getUser()
        if (currentUser) {
          currentUser.avatar = null
          authService.setUser(currentUser)
        }

        alert(this.$t('ProfileView.deleteAvatarComplete'))

      } catch (error) {
        console.error('❌ Error eliminando avatar:', error)
        alert(this.$t('ProfileView.deleteAvatarError', { message: error.message }))
      }
    },

    fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = () => {
          resolve(reader.result)
        }
        
        reader.onerror = () => {
          reject(new Error('Error al leer el archivo'))
        }
        
        reader.readAsDataURL(file)
      })
    },

    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.profile-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: #2d3748;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e53e3e;
  background: rgba(254, 178, 178, 0.2);
  border: 1px solid rgba(254, 178, 178, 0.5);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  margin: 40px 0;
}

.profile-layout {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr 2fr;
}

.profile-card,
.info-card,
.stats-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stats-card {
  grid-column: 1 / -1;
}

.avatar-section {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar-image,
.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.avatar-image {
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
}

.change-avatar-button {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.change-avatar-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.change-avatar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #ffffff40;
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.user-info {
  text-align: center;
}

.user-info h2 {
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.role-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.teacher {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.role-badge.student {
  background: rgba(72, 187, 120, 0.1);
  color: #48bb78;
}

.info-card h3,
.stats-card h3 {
  color: #2d3748;
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px 0;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.form-group input:focus:not(:disabled) {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f7fafc;
  color: #718096;
}

.form-group input.readonly {
  background: #edf2f7;
  border-color: #e2e8f0;
}

.help-text {
  color: #718096;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.edit-button,
.cancel-button,
.save-button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.edit-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.cancel-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.save-button {
  background: linear-gradient(135deg, #48bb78, #38a169);
  color: white;
}

.edit-button:hover,
.save-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.cancel-button:hover {
  background: #edf2f7;
}

.save-button:disabled {
  background: #a0aec0;
  cursor: not-allowed;
  transform: none;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.stat-item {
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.stat-name {
  color: #2d3748;
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.stat-count {
  color: #667eea;
  font-weight: 700;
  font-size: 20px;
}

.lang-switcher-wrapper {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 100;
}

.avatar-actions {
  position: relative;
}

.change-avatar-button {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.delete-avatar-button {
  position: absolute;
  bottom: -8px;
  left: -8px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.change-avatar-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.delete-avatar-button {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  color: white;
}

.change-avatar-button:hover,
.delete-avatar-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.change-avatar-button:disabled,
.delete-avatar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #ffffff40;
  border-top: 3px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.upload-text {
  color: white;
  font-size: 12px;
  font-weight: 600;
}

.avatar-info {
  text-align: center;
  margin-top: 12px;
}

.avatar-source {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #718096;
  font-size: 11px;
  background: rgba(243, 156, 18, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid rgba(243, 156, 18, 0.2);
}

@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>