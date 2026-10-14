<template>
  <AppShell :is-loading="busy" loading-message="Criando sua conta...">
    <section class="auth-card">
      <p class="eyebrow">NOVA CONTA</p>
      <h1>Crie seu acesso</h1>
      <p class="muted">Depois do cadastro, complete seu perfil.</p>
      <SetupNotice />
      <form @submit.prevent="submit">
        <ion-item>
          <ion-label position="stacked">Nome completo</ion-label>
          <ion-input v-model="fullName" autocomplete="name" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">E-mail</ion-label>
          <ion-input
            v-model="email"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="nome@dominio.com"
            required
          />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Senha (mínimo de 8 caracteres)</ion-label>
          <ion-input v-model="password" type="password" autocomplete="new-password" :minlength="8" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Confirme a senha</ion-label>
          <ion-input v-model="confirmation" type="password" autocomplete="new-password" :minlength="8" required />
        </ion-item>
        <ion-button expand="block" type="submit" :disabled="busy || !isSupabaseConfigured">
          {{ busy ? 'Criando conta...' : 'Criar conta' }}
        </ion-button>
      </form>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <p class="auth-links">Já tem conta? <router-link to="/entrar">Entrar</router-link></p>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import SetupNotice from '../components/SetupNotice.vue'
import { authErrorMessage, signUp } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmation = ref('')
const busy = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (!fullName.value.trim()) {
    message.value = 'Informe seu nome completo.'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    message.value = 'Informe um endereço de e-mail válido.'
    return
  }
  if (password.value.length < 8) {
    message.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }
  if (password.value !== confirmation.value) {
    message.value = 'As senhas não coincidem.'
    return
  }
  busy.value = true
  try {
    const { session } = await signUp(email.value.trim(), password.value, fullName.value.trim())
    if (session) {
      await router.replace('/perfil')
    } else {
      message.value = 'Conta criada! Confirme seu e-mail e depois faça login para continuar.'
    }
  } catch (error) {
    message.value = authErrorMessage(error, 'Não foi possível criar a conta.')
  } finally {
    busy.value = false
  }
}
</script>
