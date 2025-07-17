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
    component: ResetPasswordView
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
    path: '*',
    redirect: '/login'
  }
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// Guard para proteger rutas
router.beforeEach((to, from, next) => {
  // Importar authService dinámicamente para evitar problemas de importación circular
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