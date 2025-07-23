import Vue from 'vue';
import App from './App.vue';
import GSignInButton from 'vue-google-signin-button';
import router from './router/index.js'

Vue.config.productionTip = false

// Configurar vue-google-signin-button
Vue.use(GSignInButton);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')