import { createClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    rawUrl &&
    rawUrl.startsWith('http') &&
    !rawUrl.includes('your_supabase_project_url') &&
    rawKey &&
    !rawKey.includes('your_supabase_anon_key')
  )
}

// Fallback to valid placeholder URL during build/SSR if env vars are not set
const validUrl = isSupabaseConfigured() && rawUrl ? rawUrl : 'https://placeholder.supabase.co'
const validKey = isSupabaseConfigured() && rawKey ? rawKey : 'placeholder-anon-key'

export const supabase = createClient(validUrl, validKey)
