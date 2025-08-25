import VueRouter from 'vue-router'
import Vue from 'vue'
import LoginView from '../views/LoginView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'
import ResetPasswordView from '../views/ResetPasswordView.vue'
import RegisterView from '../views/RegisterView.vue'
import ActivateAccountView from '../views/ActivateAccountView.vue'
import ProfileView from '../views/ProfileView.vue'
import StudentDashboard from '../views/StudentDashboard.vue'
import TeacherDashboard from '../views/TeacherDashboard.vue'
import ChatView from '../views/ChatView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ErrorView from '../views/ErrorView.vue'
import SubjectsManager from '../views/SubjectsManager.vue'
import ChatHistoryView from '../views/ChatHistoryView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
    beforeEnter: (to, from, next) => {
      const resetToken = to.query.token;
      
      if (!resetToken || resetToken.trim() === '') {
        console.log('❌ Acceso denegado: No se proporcionó reset_token');
        next('/forgot-password');
      } else {
        console.log('✅ Acceso permitido: Token proporcionado');
        next();
      }
    }
  },
  {
    path: '/activate-account',
    name: 'ActivateAccount',
    component: ActivateAccountView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher-dashboard',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },

  {
    path: '/chat',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true }
  },

  {
    path: '/error/:code?',
    name: 'Error',
    component: ErrorView,
    props: true
  },

  {
    path: '*',
    name: 'NotFound', 
    component: NotFoundView
  },

  {
    path: '/subjects',
    name: 'Subjects',
    component: SubjectsManager,
    meta: { requiresAuth: true }
  },
  {
  path: '/chat-history',
  name: 'ChatHistory', 
  component: ChatHistoryView,
  meta: { requiresAuth: true }
}
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

router.beforeEach((to, from, next) => {

  import('../services/authService').then(({ default: authService }) => {
    if (to.meta.requiresAuth) {
      if (!authService.isAuthenticated()) {
        next('/login')
      } else {
        next()
      }
    } else {
      next()
    }
  })
})

export default router