import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Application, ApplicationFormData } from '@/types'
import { getCurrentUser } from '@/lib/auth'

const LOCAL_STORAGE_KEY = 'jobtrack_demo_applications_v2'

function getLocalApplications(userId?: string): Application[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    const all: Application[] = raw ? JSON.parse(raw) : []
    if (userId) {
      return all.filter((a) => a.user_id === userId)
    }
    return all
  } catch {
    return []
  }
}

function saveLocalApplications(apps: Application[], userId?: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    let all: Application[] = raw ? JSON.parse(raw) : []
    if (userId) {
      // Keep other users' applications and update current user's applications
      all = all.filter((a) => a.user_id !== userId).concat(apps)
    } else {
      all = apps
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export async function getApplications(): Promise<Application[]> {
  const user = await getCurrentUser()
  if (!user) return []

  if (!isSupabaseConfigured()) {
    const apps = getLocalApplications(user.id)
    return apps.sort((a, b) => new Date(b.application_date).getTime() - new Date(a.application_date).getTime())
  }

  // With Supabase RLS, select('*') automatically filters by auth.uid() = user_id
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('application_date', { ascending: false })

  if (error) {
    console.error('Supabase query error:', error)
    throw error
  }
  return data || []
}

export async function createApplication(formData: ApplicationFormData): Promise<Application> {
  const user = await getCurrentUser()
  if (!user) throw new Error('You must be signed in to create an application')

  if (!isSupabaseConfigured()) {
    const newApp: Application = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app_${Date.now()}`,
      user_id: user.id,
      company_name: formData.company_name,
      position: formData.position,
      application_date: formData.application_date,
      response_received: formData.response_received,
      response_outcome: formData.response_received ? formData.response_outcome : 'na',
      job_type: formData.job_type,
      application_source: formData.application_source,
      comments: formData.comments ? formData.comments : null,
      created_at: new Date().toISOString(),
    }
    const current = getLocalApplications(user.id)
    saveLocalApplications([newApp, ...current], user.id)
    return newApp
  }

  const payload = {
    user_id: user.id,
    company_name: formData.company_name,
    position: formData.position,
    application_date: formData.application_date,
    response_received: formData.response_received,
    response_outcome: formData.response_received ? formData.response_outcome : 'na',
    job_type: formData.job_type,
    application_source: formData.application_source,
    comments: formData.comments ? formData.comments : null,
  }

  const { data, error } = await supabase
    .from('applications')
    .insert([payload])
    .select()
    .single()

  if (error) {
    console.error('Supabase insert error:', error)
    throw error
  }
  return data
}

export async function updateApplication(
  id: string,
  formData: ApplicationFormData
): Promise<Application> {
  const user = await getCurrentUser()
  if (!user) throw new Error('You must be signed in to update an application')

  if (!isSupabaseConfigured()) {
    const current = getLocalApplications(user.id)
    const index = current.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Application not found')

    const updatedApp: Application = {
      ...current[index],
      company_name: formData.company_name,
      position: formData.position,
      application_date: formData.application_date,
      response_received: formData.response_received,
      response_outcome: formData.response_received ? formData.response_outcome : 'na',
      job_type: formData.job_type,
      application_source: formData.application_source,
      comments: formData.comments ? formData.comments : null,
    }

    current[index] = updatedApp
    saveLocalApplications([...current], user.id)
    return updatedApp
  }

  const payload = {
    company_name: formData.company_name,
    position: formData.position,
    application_date: formData.application_date,
    response_received: formData.response_received,
    response_outcome: formData.response_received ? formData.response_outcome : 'na',
    job_type: formData.job_type,
    application_source: formData.application_source,
    comments: formData.comments ? formData.comments : null,
  }

  const { data, error } = await supabase
    .from('applications')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Supabase update error:', error)
    throw error
  }
  return data
}

export async function deleteApplication(id: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('You must be signed in to delete an application')

  if (!isSupabaseConfigured()) {
    const current = getLocalApplications(user.id)
    const filtered = current.filter((a) => a.id !== id)
    saveLocalApplications(filtered, user.id)
    return
  }

  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) {
    console.error('Supabase delete error:', error)
    throw error
  }
}
