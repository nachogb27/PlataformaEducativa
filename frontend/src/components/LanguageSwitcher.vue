<template>
  <div class="language-switcher">
    <button
      :class="['lang-btn', { active: currentLang === 'es' }]"
      @click="setLang('es')"
      title="Español"
      aria-label="Español"
    >
      <svg class="flag" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
        <rect width="3" height="2" fill="#aa151b"/>
        <rect width="3" height="1" y="0.5" fill="#f1bf00"/>
      </svg>
    </button>
    <button
      :class="['lang-btn', { active: currentLang === 'en' }]"
      @click="setLang('en')"
      title="English"
      aria-label="English"
    >
      <svg class="flag" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="30" fill="#012169"/>
        <g stroke="#fff" stroke-width="6">
          <path d="m0,0 60,30 m0,-30 -60,30"/>
        </g>
        <g stroke="#C8102E" stroke-width="4">
          <path d="m0,0 60,30 m0,-30 -60,30"/>
        </g>
        <g stroke="#fff" stroke-width="10">
          <path d="M30,0 v30 M0,15 h60"/>
        </g>
        <g stroke="#C8102E" stroke-width="6">
          <path d="M30,0 v30 M0,15 h60"/>
        </g>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'LanguageSwitcher',
  computed: {
    currentLang() {
      return this.$i18n.locale;
    }
  },
  methods: {
    setLang(lang) {
      if (this.$i18n.locale !== lang) {
        this.$i18n.locale = lang;
        localStorage.setItem('lang', lang);
      }
    }
  }
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  gap: 14px;
  justify-content: flex-end;
  align-items: center;
}

.lang-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
  position: relative;
  overflow: hidden;
}

.lang-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.25);
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.4);
}

.lang-btn:hover:not(.active) {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e0);
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

.flag {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.lang-btn:hover .flag {
  transform: scale(1.1);
}

.lang-btn.active .flag {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>