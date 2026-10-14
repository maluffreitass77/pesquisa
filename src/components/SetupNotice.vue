<template>
  <ion-card v-if="!isSupabaseConfigured" color="warning">
    <ion-card-content>
      <strong>Cadastro e login indisponíveis:</strong> {{ setupMessage }}
      <p>Após salvar o arquivo, pare o Vite (Ctrl+C) e execute <code>npm run dev</code> novamente.</p>
      <p>Este aviso desaparece quando a aplicação reconhece as credenciais válidas.</p>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent } from '@ionic/vue'
import { getSupabaseSetupMessage, isSupabaseConfigured } from '../services/supabase'

const setupMessage = getSupabaseSetupMessage()
</script>
