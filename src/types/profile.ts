export interface Profile {
  id: string
  name: string
  birth_date: string
  nickname: string
  avatar_path: string | null
  created_at: string
  updated_at: string
}

export interface ProfileInput {
  name: string
  birth_date: string
  nickname: string
  avatar_path: string | null
}
