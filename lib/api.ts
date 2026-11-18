import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Application, ApplicationFormData } from '@/types'

const LOCAL_STORAGE_KEY = 'jobtrack_demo_applications'

const initialMockApplications: Application[] = [
  {
    id: 'e4a053c8-1111-46bb-9f22-1d58231a4001',
    company_name: 'Stripe',
    position: 'Full Stack Engineer',
    application_date: '2026-11-15',
    response_received: true,
    response_outcome: 'positive',
    job_type: 'remote',
    application_source: 'linkedin',
    comments: 'Recruiter reached out for initial phone screen on Thursday.',
    created_at: new Date('2026-11-15T10:00:00Z').toISOString(),
  },
  {
    id: 'e4a053c8-2222-46bb-9f22-1d58231a4002',
    company_name: 'Vercel',
    position: 'Frontend Engineer',
    application_date: '2026-11-12',
    response_received: true,
    response_outcome: 'positive',
    job_type: 'remote',
    application_source: 'website',
    comments: 'Take-home assessment submitted.',
    created_at: new Date('2026-11-12T14:30:00Z').toISOString(),
  },
  {
    id: 'e4a053c8-3333-46bb-9f22-1d58231a4003',
    company_name: 'Linear',
    position: 'Product Engineer',
    application_date: '2026-11-10',
    response_received: false,
    response_outcome: 'na',
    job_type: 'remote',
    application_source: 'website',
    comments: 'Applied directly through careers page.',
    created_at: new Date('2026-11-10T09:15:00Z').toISOString(),
  },
  {
    id: 'e4a053c8-4444-46bb-9f22-1d58231a4004',
    company_name: 'Datadog',
    position: 'Software Engineer - Infrastructure',
    application_date: '2026-11-05',
    response_received: true,
    response_outcome: 'negative',
    job_type: 'hybrid',
    application_source: 'email',
    comments: 'Position was filled internally.',
    created_at: new Date('2026-11-05T16:00:00Z').toISOString(),
  },
  {
    id: 'e4a053c8-5555-46bb-9f22-1d58231a4005',
    company_name: 'Figma',
    position: 'Software Engineer',
    application_date: '2026-11-02',
    response_received: false,
    response_outcome: 'na',
    job_type: 'onsite',
    application_source: 'linkedin',
    comments: 'Referred by alumni contact.',
    created_at: new Date('2026-11-02T11:45:00Z').toISOString(),
  },
]

function getLocalApplications(): Application[] {
  if (typeof window === 'undefined') return initialMockApplications
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockApplications))
      return initialMockApplications
    }
    return JSON.parse(raw)
  } catch {
    return initialMockApplications
  }
}

function saveLocalApplications(apps: Application[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apps))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export async function getApplications(): Promise<Application[]> {
  if (!isSupabaseConfigured()) {
    return getLocalApplications()
  }

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
  if (!isSupabaseConfigured()) {
    const newApp: Application = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `app_${Date.now()}`,
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
    const current = getLocalApplications()
    saveLocalApplications([newApp, ...current])
    return newApp
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
  if (!isSupabaseConfigured()) {
    const current = getLocalApplications()
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
    saveLocalApplications([...current])
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
  if (!isSupabaseConfigured()) {
    const current = getLocalApplications()
    const filtered = current.filter((a) => a.id !== id)
    saveLocalApplications(filtered)
    return
  }

  const { error } = await supabase.from('applications').delete().eq('id', id)
  if (error) {
    console.error('Supabase delete error:', error)
    throw error
  }
}
