import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { currentUser } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'
import { getProfile } from '../services/profile'

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/entrar' },
  { path: '/entrar', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
  { path: '/cadastro', component: () => import('../views/RegisterView.vue'), meta: { guestOnly: true } },
  { path: '/recuperar-senha', component: () => import('../views/ForgotPasswordView.vue'), meta: { guestOnly: true } },
  { path: '/redefinir-senha', component: () => import('../views/ResetPasswordView.vue') },
  { path: '/perfil', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/inicio', component: () => import('../views/WelcomeView.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/entrar' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (!isSupabaseConfigured) return to.meta.requiresAuth ? '/entrar' : true
  const isAuthenticated = Boolean(currentUser.value)

  if (to.meta.requiresAuth && !isAuthenticated) return '/entrar'
  if (to.meta.guestOnly && isAuthenticated) return '/inicio'

  if (to.path === '/inicio' && currentUser.value) {
    try {
      const profile = await getProfile(currentUser.value.id)
      if (!profile?.name || !profile.birth_date) return '/perfil'
    } catch (error) {
      console.error('Não foi possível carregar o perfil:', error)
      return '/perfil'
    }
  }

  return true
})

export default router
