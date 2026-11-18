import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { UserProfile } from '@/types'

const LOCAL_AUTH_USER_KEY = 'jobtrack_auth_user'
const LOCAL_USERS_KEY = 'jobtrack_local_users_db'

function usernameToEmail(username: string): string {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  return `${clean}@jobtrack.local`
}

export function emailToUsername(email: string): string {
  return email.replace(/@jobtrack\.local$/i, '')
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session?.user) return null

  const username = session.user.user_metadata?.username || emailToUsername(session.user.email || 'user')
  return {
    id: session.user.id,
    username,
  }
}

export async function signUpWithUsername(username: string, password: string): Promise<UserProfile> {
  const cleanUsername = username.trim().toLowerCase()
  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long')
  }
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long')
  }

  if (!isSupabaseConfigured()) {
    const rawUsers = localStorage.getItem(LOCAL_USERS_KEY)
    const users: Record<string, { id: string; passwordHash: string }> = rawUsers ? JSON.parse(rawUsers) : {}
    if (users[cleanUsername]) {
      throw new Error('Username already exists. Please sign in.')
    }
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `usr_${Date.now()}`
    users[cleanUsername] = { id: newId, passwordHash: password }
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))

    const profile: UserProfile = { id: newId, username: cleanUsername }
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile))
    return profile
  }

  const email = usernameToEmail(cleanUsername)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: cleanUsername },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Username is already taken. Please choose another or sign in.')
    }
    throw error
  }

  if (!data.user) {
    throw new Error('Failed to create account')
  }

  return {
    id: data.user.id,
    username: cleanUsername,
  }
}

export async function signInWithUsername(username: string, password: string): Promise<UserProfile> {
  const cleanUsername = username.trim().toLowerCase()
  if (!cleanUsername) throw new Error('Username is required')
  if (!password) throw new Error('Password is required')

  if (!isSupabaseConfigured()) {
    const rawUsers = localStorage.getItem(LOCAL_USERS_KEY)
    const users: Record<string, { id: string; passwordHash: string }> = rawUsers ? JSON.parse(rawUsers) : {}
    const found = users[cleanUsername]
    if (!found || found.passwordHash !== password) {
      throw new Error('Invalid username or password')
    }
    const profile: UserProfile = { id: found.id, username: cleanUsername }
    localStorage.setItem(LOCAL_AUTH_USER_KEY, JSON.stringify(profile))
    return profile
  }

  const email = usernameToEmail(cleanUsername)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('Invalid username or password')
    }
    throw error
  }

  if (!data.user) {
    throw new Error('Sign in failed')
  }

  return {
    id: data.user.id,
    username: data.user.user_metadata?.username || cleanUsername,
  }
}

export async function signOutUser(): Promise<void> {
  if (!isSupabaseConfigured()) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_AUTH_USER_KEY)
    }
    return
  }

  await supabase.auth.signOut()
}
