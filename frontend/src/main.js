import Vue from 'vue';
import App from './App.vue';
import GSignInButton from 'vue-google-signin-button';
import router from './router/index.js'
import i18n from './i18n';

Vue.config.productionTip = false

// Configurar vue-google-signin-button
Vue.use(GSignInButton);

new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')