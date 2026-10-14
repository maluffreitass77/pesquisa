<template>
  <AppShell :is-loading="busy" loading-message="Atualizando sua senha...">
    <section class="auth-card">
      <p class="eyebrow">NOVA SENHA</p>
      <h1>Redefina sua senha</h1>
      <p class="muted">Escolha uma senha com pelo menos 8 caracteres.</p>
      <form @submit.prevent="submit">
        <ion-item>
          <ion-label position="stacked">Nova senha</ion-label>
          <ion-input v-model="password" type="password" autocomplete="new-password" :minlength="8" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Confirme a senha</ion-label>
          <ion-input v-model="confirmation" type="password" autocomplete="new-password" :minlength="8" required />
        </ion-item>
        <ion-button expand="block" type="submit" :disabled="busy">
          {{ busy ? 'Salvando...' : 'Salvar nova senha' }}
        </ion-button>
      </form>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <p class="auth-links"><router-link to="/entrar">Voltar para entrar</router-link></p>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonItem, IonLabel, IonInput, IonButton } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import { authErrorMessage, updatePassword } from '../services/auth'

const router = useRouter()
const password = ref('')
const confirmation = ref('')
const busy = ref(false)
const message = ref('')

async function submit() {
  message.value = ''
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
    await updatePassword(password.value)
    message.value = 'Senha atualizada com sucesso.'
    await router.replace('/inicio')
  } catch (error) {
    message.value = authErrorMessage(error, 'Não foi possível atualizar a senha.')
  } finally {
    busy.value = false
  }
}
</script>
