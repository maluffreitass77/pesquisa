import { requireSupabase } from './supabase'
import { getAvatarUrl } from './storage'
import type { Profile, ProfileInput } from '../types/profile'

export async function getProfile(userId: string) {
  const client = requireSupabase()
  const { data, error } = await client
    .from('profiles')
    .select('id, name, birth_date, nickname, avatar_path, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  let avatarUrl: string | null = null
  if (data.avatar_path) {
    avatarUrl = await getAvatarUrl(data.avatar_path)
  }

  return { ...data, avatar_url: avatarUrl } satisfies Profile & { avatar_url: string | null }
}

export async function saveProfile(userId: string, profile: ProfileInput) {
  const { error } = await requireSupabase().from('profiles').upsert({
    id: userId,
    ...profile,
    updated_at: new Date().toISOString(),
  })
  if (error) throw error
}
