<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-title>Meu Perfil</ion-title>
        <ion-buttons slot="end">
          <ion-button v-if="showLogout" @click="logout">Sair</ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <main class="page-wrap">
        <slot />
      </main>
    </ion-content>
    <ion-loading :is-open="isLoading" :message="loadingMessage" />
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonLoading } from '@ionic/vue'
import { signOut } from '../services/auth'

withDefaults(defineProps<{ showLogout?: boolean; isLoading?: boolean; loadingMessage?: string }>(), {
  showLogout: false,
  isLoading: false,
  loadingMessage: 'Aguarde...',
})
const router = useRouter()

async function logout() {
  try {
    await signOut()
    await router.replace('/entrar')
  } catch (error) {
    console.error(error)
    window.alert('Não foi possível encerrar a sessão. Tente novamente.')
  }
}
</script>
