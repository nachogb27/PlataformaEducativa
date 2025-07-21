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
import NotFoundView from '../views/NotFoundView.vue'
import ErrorView from '../views/ErrorView.vue'
import SubjectsManager from '../views/SubjectsManager.vue'

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
    // 🔒 Validación: Impedir acceso sin token
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
  // 🆕 Nueva ruta para errores con código específico
  {
    path: '/error/:code?',
    name: 'Error',
    component: ErrorView,
    props: true
  },
  // 🆕 Ruta 404 - DEBE IR AL FINAL
  {
    path: '*',
    name: 'NotFound', 
    component: NotFoundView
  },
  // 🆕 Rutas para gestión de asignaturas 
  {
  path: '/subjects',
  name: 'Subjects',
  component: SubjectsManager,
  meta: { requiresAuth: true } // Asegurar que requiere autenticación
}
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// Guard para proteger rutas autenticadas
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