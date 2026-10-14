<template>
  <AppShell :show-logout="true" :is-loading="loading" loading-message="Carregando seu perfil...">
    <section class="welcome-card">
      <p class="eyebrow">ÁREA DO USUÁRIO</p>
      <ion-avatar v-if="avatarUrl" class="avatar-frame welcome-avatar">
        <ion-img :src="avatarUrl" alt="Foto de perfil" />
      </ion-avatar>
      <div v-else class="avatar welcome-avatar avatar-placeholder" aria-hidden="true">{{ initial }}</div>
      <h1>Bem-vindo(a), {{ displayName }}!</h1>
      <p class="muted">Que bom ter você aqui. Login realizado com sucesso.</p>
      <div class="profile-summary">
        <p><strong>E-mail</strong><span>{{ email }}</span></p>
        <p><strong>Data de nascimento</strong><span>{{ formattedBirthDate }}</span></p>
        <p v-if="nickname"><strong>Nickname</strong><span>{{ nickname }}</span></p>
      </div>
      <ion-button expand="block" fill="outline" router-link="/perfil">Meu perfil</ion-button>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { IonAvatar, IonImg, IonButton } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import { currentUser } from '../services/auth'
import { getProfile } from '../services/profile'

const name = ref('')
const birthDate = ref('')
const nickname = ref('')
const avatarUrl = ref<string | null>(null)
const loading = ref(true)
const email = computed(() => currentUser.value?.email ?? '')
const displayName = computed(() => nickname.value || name.value)
const initial = computed(() => name.value.trim().charAt(0).toUpperCase() || '?')
const formattedBirthDate = computed(() => {
  if (!birthDate.value) return ''
  return new Date(`${birthDate.value}T00:00:00`).toLocaleDateString('pt-BR')
})

onMounted(async () => {
  const user = currentUser.value
  if (!user) {
    loading.value = false
    return
  }
  try {
    const profile = await getProfile(user.id)
    if (profile) {
      name.value = profile.name
      birthDate.value = profile.birth_date
      nickname.value = profile.nickname
      avatarUrl.value = profile.avatar_url
    }
  } catch (error) {
    console.error(error)
    window.alert('Não foi possível carregar seu perfil. Verifique sua conexão.')
  } finally {
    loading.value = false
  }
})
</script>
