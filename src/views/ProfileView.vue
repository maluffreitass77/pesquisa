<template>
  <AppShell
    :show-logout="true"
    :is-loading="loading || saving || photoBusy"
    :loading-message="photoBusy ? 'Enviando foto...' : saving ? 'Salvando seu perfil...' : 'Carregando seu perfil...'"
  >
    <section class="profile-card">
      <p class="eyebrow">SEU PERFIL</p>
      <h1>Complete seu perfil</h1>
      <p class="muted">As informações ficam vinculadas somente à sua conta.</p>
      <div class="avatar-block">
        <ion-avatar v-if="avatarUrl" class="avatar-frame">
          <ion-img :src="avatarUrl" alt="Foto de perfil" />
        </ion-avatar>
        <div v-else class="avatar avatar-placeholder" aria-label="Avatar padrão">
          {{ initial }}
        </div>
        <ion-button fill="outline" size="small" @click="selectPhoto" :disabled="loading || saving || photoBusy">
          Alterar foto
        </ion-button>
        <small>JPEG, PNG ou WebP; até 5 MB.</small>
      </div>
      <form @submit.prevent="submit">
        <ion-item>
          <ion-label position="stacked">Nome completo *</ion-label>
          <ion-input v-model="name" autocomplete="name" required :maxlength="100" />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Data de nascimento *</ion-label>
          <ion-input v-model="birthDate" type="date" autocomplete="bday" required />
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Nickname</ion-label>
          <ion-input v-model="nickname" autocomplete="nickname" :maxlength="40" />
        </ion-item>
        <ion-button expand="block" type="submit" :disabled="loading || saving || photoBusy">
          Salvar perfil
        </ion-button>
      </form>
      <p v-if="message" class="form-message" role="status">{{ message }}</p>
      <ion-button class="back-button" fill="clear" @click="goBack">Voltar</ion-button>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonAvatar, IonImg, IonButton, IonItem, IonLabel, IonInput } from '@ionic/vue'
import AppShell from '../components/AppShell.vue'
import { currentUser } from '../services/auth'
import { getProfile, saveProfile } from '../services/profile'
import { chooseAndUploadAvatar, getAvatarUrl, removeAvatar } from '../services/storage'

const router = useRouter()
const name = ref('')
const birthDate = ref('')
const nickname = ref('')
const avatarPath = ref<string | null>(null)
const savedAvatarPath = ref<string | null>(null)
const avatarUrl = ref<string | null>(null)
const loading = ref(true)
const saving = ref(false)
const photoBusy = ref(false)
const message = ref('')
const initial = computed(() => name.value.trim().charAt(0).toUpperCase() || '?')

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
      avatarPath.value = profile.avatar_path
      savedAvatarPath.value = profile.avatar_path
      avatarUrl.value = profile.avatar_url
    } else {
      name.value = String(user.user_metadata.full_name ?? '')
    }
  } catch (error) {
    console.error(error)
    message.value = 'Não foi possível carregar o perfil. Verifique a conexão e tente novamente.'
  } finally {
    loading.value = false
  }
})

function isValidBirthDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date <= new Date()
}

async function submit() {
  const user = currentUser.value
  if (!user) return
  message.value = ''
  if (!name.value.trim()) {
    message.value = 'Informe seu nome completo.'
    return
  }
  if (!isValidBirthDate(birthDate.value)) {
    message.value = 'Informe uma data de nascimento válida, que não seja futura.'
    return
  }

  saving.value = true
  try {
    await saveProfile(user.id, {
      name: name.value.trim(),
      birth_date: birthDate.value,
      nickname: nickname.value.trim(),
      avatar_path: avatarPath.value,
    })
    await router.replace('/inicio')
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Não foi possível salvar o perfil.'
  } finally {
    saving.value = false
  }
}

async function selectPhoto() {
  const user = currentUser.value
  if (!user) return
  message.value = ''
  if (!name.value.trim()) {
    message.value = 'Informe seu nome completo antes de alterar a foto.'
    return
  }
  if (!isValidBirthDate(birthDate.value)) {
    message.value = 'Informe uma data de nascimento válida antes de alterar a foto.'
    return
  }
  photoBusy.value = true
  try {
    await saveProfile(user.id, {
      name: name.value.trim(),
      birth_date: birthDate.value,
      nickname: nickname.value.trim(),
      avatar_path: savedAvatarPath.value,
    })
    const path = await chooseAndUploadAvatar(user.id)
    const previousPath = savedAvatarPath.value
    try {
      await saveProfile(user.id, {
        name: name.value.trim(),
        birth_date: birthDate.value,
        nickname: nickname.value.trim(),
        avatar_path: path,
      })
    } catch (error) {
      try {
        await removeAvatar(path)
      } catch (cleanupError) {
        console.error('Não foi possível remover o upload que não foi salvo:', cleanupError)
      }
      throw error
    }

    avatarPath.value = path
    savedAvatarPath.value = path
    avatarUrl.value = await getAvatarUrl(path)
    if (previousPath && previousPath !== path) {
      try {
        await removeAvatar(previousPath)
      } catch (error) {
        console.error('A foto anterior não pôde ser removida:', error)
        message.value = 'Foto atualizada, mas não foi possível remover a foto anterior.'
        return
      }
    }
    message.value = 'Foto de perfil atualizada.'
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Não foi possível enviar a foto.'
  } finally {
    photoBusy.value = false
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else void router.replace('/inicio')
}
</script>
