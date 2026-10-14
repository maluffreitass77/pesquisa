import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabasePublishableKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
).trim()

const urlIsValid = (() => {
  try {
    const url = new URL(supabaseUrl)
    return url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  } catch {
    return false
  }
})()

const hasPlaceholderValues =
  supabaseUrl.includes('seu-projeto') ||
  supabasePublishableKey.includes('sua-chave') ||
  supabasePublishableKey.includes('sua-chave-publica')
const isSecretKey = supabasePublishableKey.startsWith('sb_secret_')

export const supabase =
  supabaseUrl && supabasePublishableKey && urlIsValid && !hasPlaceholderValues && !isSecretKey
    ? createClient<Database>(supabaseUrl.replace(/\/+$/, ''), supabasePublishableKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null

export const isSupabaseConfigured = supabase !== null

export function getSupabaseSetupMessage() {
  if (!supabaseUrl || !supabasePublishableKey) {
    return 'Ainda não existe configuração Supabase válida. Crie o arquivo .env na raiz do projeto e preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY com os valores reais de Project URL e Publishable key do painel Supabase. Não use os valores de exemplo.'
  }
  if (!urlIsValid) {
    return 'A VITE_SUPABASE_URL não parece uma URL válida. Copie a Project URL completa do painel Supabase (deve começar com https://).'
  }
  if (hasPlaceholderValues) {
    return 'O arquivo .env ainda contém valores de exemplo. Substitua-os pela Project URL e pela Publishable key reais do seu projeto Supabase.'
  }
  if (isSecretKey) {
    return 'Foi informada uma chave secreta (sb_secret_). No aplicativo use somente a Publishable key ou a chave anon legada; nunca coloque chaves secretas no cliente.'
  }
  return ''
}

export function requireSupabase() {
  if (!supabase) {
    throw new Error(getSupabaseSetupMessage())
  }

  return supabase
}
