export type ResponseOutcome = 'positive' | 'negative' | 'na'
export type JobType = 'remote' | 'hybrid' | 'onsite'
export type ApplicationSource = 'website' | 'linkedin' | 'email'

export interface Application {
  id: string
  user_id?: string
  company_name: string
  position: string
  application_date: string
  response_received: boolean
  response_outcome: ResponseOutcome
  job_type: JobType
  application_source: ApplicationSource
  comments: string | null
  created_at: string
}

export interface ApplicationFormData {
  company_name: string
  position: string
  application_date: string
  response_received: boolean
  response_outcome: ResponseOutcome
  job_type: JobType
  application_source: ApplicationSource
  comments: string
}

export interface FilterState {
  search: string
  response: string
  jobType: string
  source: string
  sortOrder: 'asc' | 'desc'
}

export interface UserProfile {
  id: string
  username: string
}
