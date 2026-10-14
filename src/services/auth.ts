import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, requireSupabase } from './supabase'
import { Capacitor } from '@capacitor/core'

const nativeAuthRedirect = 'br.edu.projeto.meuperfil://auth-callback'

export function getAuthRedirectUrl() {
  return Capacitor.isNativePlatform()
    ? nativeAuthRedirect
    : new URL('/redefinir-senha', window.location.origin).toString()
}

function getSignupRedirectUrl() {
  return Capacitor.isNativePlatform()
    ? nativeAuthRedirect
    : new URL('/entrar', window.location.origin).toString()
}

export const currentUser = ref<User | null>(null)
let initialized = false

export async function initializeAuth() {
  if (initialized || !isSupabaseConfigured) return

  const client = requireSupabase()
  const { data, error } = await client.auth.getSession()
  if (error) throw error
  currentUser.value = data.session?.user ?? null

  client.auth.onAuthStateChange((_event, session) => {
    currentUser.value = session?.user ?? null
  })
  initialized = true
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password })
  if (error) throw error
  currentUser.value = data.user
}

export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await requireSupabase().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: getSignupRedirectUrl(),
    },
  })
  if (error) throw error
  if (!data.user) {
    throw new Error('O Supabase não retornou a conta criada. Verifique a configuração do projeto e tente novamente.')
  }
  if (!data.session && data.user.identities?.length === 0) {
    throw new Error('Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.')
  }
  currentUser.value = data.session?.user ?? null
  return data
}

export async function sendPasswordReset(email: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  const { data, error } = await requireSupabase().auth.updateUser({ password })
  if (error) throw error
  currentUser.value = data.user
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
  currentUser.value = null
}

export function authErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  const message = error.message.toLowerCase()
  if (message.includes('failed to fetch') || message.includes('networkerror')) {
    return 'Não foi possível conectar ao Supabase. Confira a Project URL, a internet e se o projeto está ativo.'
  }
  if (message.includes('invalid api key') || message.includes('no api key found')) {
    return 'A chave do Supabase é inválida. Confira se VITE_SUPABASE_PUBLISHABLE_KEY contém a Publishable key ou anon key do mesmo projeto.'
  }
  if (message.includes('redirect') && (message.includes('not allowed') || message.includes('url'))) {
    return 'A URL de retorno não está permitida no Supabase. Em Authentication → URL Configuration → Redirect URLs, adicione a URL local mostrada no navegador.'
  }
  if (message.includes('error sending confirmation email') || message.includes('smtp')) {
    return 'A conta não pôde ser confirmada por e-mail. Verifique o serviço de e-mail em Authentication → SMTP Settings no Supabase.'
  }
  if (message.includes('unable to validate email address') || message.includes('invalid email')) {
    return 'O Supabase recusou o e-mail. Informe um endereço válido, por exemplo nome@dominio.com.'
  }
  if (message.includes('invalid login credentials')) return 'E-mail ou senha inválidos.'
  if (
    message.includes('already registered') ||
    message.includes('already been registered') ||
    message.includes('user already registered')
  ) {
    return 'Este e-mail já possui uma conta.'
  }
  if (
    message.includes('password') &&
    (message.includes('length') || message.includes('short') || message.includes('at least'))
  ) {
    return 'A senha deve ter pelo menos 8 caracteres.'
  }
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return 'Muitas tentativas. Aguarde um pouco e tente novamente.'
  }
  return error.message
}
