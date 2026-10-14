<template>
  <AppShell :is-loading="busy" loading-message="Enviando link de recuperação...">
    <section class="auth-card">
      <p class="eyebrow">RECUPERAÇÃO DE ACESSO</p>
      <h1>Esqueceu sua senha?</h1>
      <p class="muted">Enviaremos um link para o e-mail informado.</p>
      <SetupNotice />
      <form @submit.prevent="submit">
        <ion-item>
          <ion-label position="stacked">E-mail</ion-label>
          <ion-input v-model="email" type="email" autocomplete="email" required />
        </ion-item>
        <ion-button expand="block" type="submit" :disabled="busy || !isSupabaseConfigured">
          {{ busy ? 'Enviando...' : 'Enviar link de recuperação' }}
        </ion-button>
      </form>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <p class="auth-links"><router-link to="/entrar">Voltar para entrar</router-link></p>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import SetupNotice from '../components/SetupNotice.vue'
import { authErrorMessage, sendPasswordReset } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'

const email = ref('')
const busy = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    message.value = 'Informe um endereço de e-mail válido.'
    return
  }
  busy.value = true
  try {
    await sendPasswordReset(email.value.trim())
    message.value = 'Se o endereço estiver cadastrado, você receberá um link para redefinir a senha.'
  } catch (error) {
    message.value = authErrorMessage(error, 'Não foi possível enviar o link de recuperação.')
  } finally {
    busy.value = false
  }
}
</script>
