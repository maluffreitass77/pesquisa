import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import type { User } from '@supabase/supabase-js'
import App from './App.vue'
import router from './router'
import { currentUser, initializeAuth } from './services/auth'
import { requireSupabase } from './services/supabase'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './style.css'
import './theme/theme.css'

async function handleAuthDeepLink(url: string) {
  try {
    const callbackUrl = new URL(url)
    const query = new URLSearchParams(callbackUrl.hash.replace(/^#/, ''))
    const accessToken = query.get('access_token') ?? callbackUrl.searchParams.get('access_token')
    const refreshToken = query.get('refresh_token') ?? callbackUrl.searchParams.get('refresh_token')
    const flowType = query.get('type') ?? callbackUrl.searchParams.get('type')
    const code = callbackUrl.searchParams.get('code')

    let user: User | null = null
    if (code) {
      const { data, error } = await requireSupabase().auth.exchangeCodeForSession(code)
      if (error) throw error
      user = data.user
    } else if (accessToken && refreshToken) {
      const { data, error } = await requireSupabase().auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (error) throw error
      user = data.user
    } else {
      throw new Error('O link não contém uma sessão válida.')
    }

    if (!user) throw new Error('O link não retornou um usuário autenticado.')
    currentUser.value = user
    await router.replace(flowType === 'recovery' ? '/redefinir-senha' : '/perfil')
  } catch (error) {
    console.error('Falha ao processar o link de autenticação:', error)
    window.alert('Este link expirou ou não é válido. Solicite um novo e tente novamente.')
  }
}

async function startApp() {
  await initializeAuth()

  createApp(App)
    .use(IonicVue)
    .use(router)
    .mount('#app')

  if (Capacitor.isNativePlatform()) {
    await CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      void handleAuthDeepLink(url)
    })
    const launch = await CapacitorApp.getLaunchUrl()
    if (launch?.url) await handleAuthDeepLink(launch.url)
  }
}

void startApp()
