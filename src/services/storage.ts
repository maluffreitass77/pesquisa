import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { requireSupabase } from './supabase'

const avatarBucket = 'avatars'
const maxPhotoSize = 5 * 1024 * 1024

export async function chooseAndUploadAvatar(userId: string) {
  const photo = await Camera.getPhoto({
    quality: 82,
    width: 900,
    height: 900,
    allowEditing: true,
    resultType: CameraResultType.Uri,
    source: CameraSource.Prompt,
  })

  if (!photo.webPath) throw new Error('Não foi possível acessar a foto selecionada.')

  const response = await fetch(photo.webPath)
  if (!response.ok) throw new Error('Não foi possível carregar a foto selecionada.')
  const blob = await response.blob()
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) {
    throw new Error('Escolha uma imagem JPEG, PNG ou WebP.')
  }
  if (blob.size > maxPhotoSize) throw new Error('A imagem deve ter no máximo 5 MB.')

  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${extension}`
  const { error } = await requireSupabase().storage.from(avatarBucket).upload(path, blob, {
    contentType: blob.type,
    upsert: true,
  })
  if (error) throw error
  return path
}

export async function getAvatarUrl(path: string) {
  const { data, error } = await requireSupabase()
    .storage.from(avatarBucket)
    .createSignedUrl(path, 60 * 60)
  if (error) throw error
  return data.signedUrl
}

export async function removeAvatar(path: string) {
  const { error } = await requireSupabase().storage.from(avatarBucket).remove([path])
  if (error) throw error
}
