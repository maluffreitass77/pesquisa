<template>
  <AppShell :is-loading="busy" loading-message="Entrando na sua conta...">
    <section class="auth-card">
      <p class="eyebrow">BEM-VINDO(A)</p>
      <h1>Entre na sua conta</h1>
      <p class="muted">Acesse seu perfil para manter seus dados sempre atualizados.</p>
      <SetupNotice />
      <form @submit.prevent="submit">
        <ion-item>
          <ion-label position="stacked">E-mail</ion-label>
          <ion-input v-model="email" type="email" autocomplete="email" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Senha</ion-label>
          <ion-input v-model="password" type="password" autocomplete="current-password" required />
        </ion-item>
        <ion-button expand="block" type="submit" :disabled="busy || !isSupabaseConfigured">
          {{ busy ? 'Entrando...' : 'Entrar' }}
        </ion-button>
      </form>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <nav class="auth-links">
        <router-link to="/recuperar-senha">Esqueci minha senha</router-link>
        <span>Não tem conta? <router-link to="/cadastro">Criar conta</router-link></span>
      </nav>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import SetupNotice from '../components/SetupNotice.vue'
import { authErrorMessage, signIn } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const busy = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    message.value = 'Informe um endereço de e-mail válido.'
    return
  }
  if (!password.value) {
    message.value = 'Informe sua senha.'
    return
  }
  busy.value = true
  try {
    await signIn(email.value.trim(), password.value)
    await router.replace('/inicio')
  } catch (error) {
    message.value = authErrorMessage(error, 'Não foi possível entrar. Verifique seus dados.')
  } finally {
    busy.value = false
  }
}
</script>
