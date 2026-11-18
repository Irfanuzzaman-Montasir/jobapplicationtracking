'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Application, ApplicationFormData } from '@/types'

interface ApplicationModalProps {
  application: Application | null
  onClose: () => void
  onSubmit: (data: ApplicationFormData) => Promise<void>
  submitting: boolean
}

const defaultFormData: ApplicationFormData = {
  company_name: '',
  position: '',
  application_date: new Date().toISOString().split('T')[0],
  response_received: false,
  response_outcome: 'na',
  job_type: 'remote',
  application_source: 'website',
  comments: '',
}

interface FormErrors {
  company_name?: string
  position?: string
  application_date?: string
}

export default function ApplicationModal({
  application,
  onClose,
  onSubmit,
  submitting,
}: ApplicationModalProps) {
  const [form, setForm] = useState<ApplicationFormData>(() => {
    if (application) {
      return {
        company_name: application.company_name,
        position: application.position,
        application_date: application.application_date,
        response_received: application.response_received,
        response_outcome: application.response_outcome,
        job_type: application.job_type,
        application_source: application.application_source,
        comments: application.comments || '',
      }
    }
    return defaultFormData
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!form.company_name.trim()) newErrors.company_name = 'Company name is required'
    if (!form.position.trim()) newErrors.position = 'Position is required'
    if (!form.application_date) newErrors.application_date = 'Application date is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const data: ApplicationFormData = {
      ...form,
      response_outcome: form.response_received ? form.response_outcome : 'na',
      company_name: form.company_name.trim(),
      position: form.position.trim(),
      comments: form.comments.trim(),
    }
    await onSubmit(data)
  }

  const inputClass = (hasError?: string) =>
    `w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border ${
      hasError
        ? 'border-red-400 dark:border-red-500'
        : 'border-gray-200 dark:border-gray-700'
    } rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors`

  const labelClass = 'block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {application ? 'Edit Application' : 'Add Application'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Company & Position */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, company_name: e.target.value }))
                  }
                  className={inputClass(errors.company_name)}
                />
                {errors.company_name && (
                  <p className="mt-1 text-xs text-red-500">{errors.company_name}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Position <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                  className={inputClass(errors.position)}
                />
                {errors.position && (
                  <p className="mt-1 text-xs text-red-500">{errors.position}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>
                Applied Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.application_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, application_date: e.target.value }))
                }
                className={inputClass(errors.application_date)}
              />
              {errors.application_date && (
                <p className="mt-1 text-xs text-red-500">{errors.application_date}</p>
              )}
            </div>

            {/* Job Type & Source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Job Type</label>
                <select
                  value={form.job_type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, job_type: e.target.value as ApplicationFormData['job_type'] }))
                  }
                  className={inputClass()}
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Applied Through</label>
                <select
                  value={form.application_source}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      application_source: e.target.value as ApplicationFormData['application_source'],
                    }))
                  }
                  className={inputClass()}
                >
                  <option value="website">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            {/* Response */}
            <div>
              <label className={labelClass}>Response Received</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, response_received: !f.response_received }))
                  }
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${
                    form.response_received ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      form.response_received ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {form.response_received ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            {/* Outcome (only if responded) */}
            {form.response_received && (
              <div>
                <label className={labelClass}>Response Outcome</label>
                <div className="flex gap-2">
                  {(['positive', 'negative', 'na'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, response_outcome: opt }))}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        form.response_outcome === opt
                          ? opt === 'positive'
                            ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-400'
                            : opt === 'negative'
                            ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {opt === 'na' ? 'Pending' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments */}
            <div>
              <label className={labelClass}>Comments</label>
              <textarea
                rows={3}
                placeholder="Any notes about this application..."
                value={form.comments}
                onChange={(e) => setForm((f) => ({ ...f, comments: e.target.value }))}
                className={`${inputClass()} resize-none`}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {application ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
