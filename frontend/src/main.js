import Vue from 'vue';
import App from './App.vue';
import GSignInButton from 'vue-google-signin-button';
import router from './router/index.js'
import i18n from './i18n';

Vue.config.productionTip = false

console.log('CLIENT ID desde .env.local:', process.env.VUE_APP_GOOGLE_CLIENT_ID);
Vue.use(GSignInButton);

new Vue({
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')