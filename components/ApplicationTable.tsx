'use client'

import { Application } from '@/types'
import { Pencil, Trash2 } from 'lucide-react'

interface ApplicationTableProps {
  applications: Application[]
  onEdit: (app: Application) => void
  onDelete: (id: string) => void
}

function ResponseBadge({ received, outcome }: { received: boolean; outcome: string }) {
  if (!received) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        No
      </span>
    )
  }
  if (outcome === 'positive') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
        Yes · Positive
      </span>
    )
  }
  if (outcome === 'negative') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
        Yes · Negative
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
      Yes
    </span>
  )
}

function JobTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    remote: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800',
    hybrid: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
    onsite: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800',
  }
  const labels: Record<string, string> = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[type] || ''}`}
    >
      {labels[type] || type}
    </span>
  )
}

function SourceBadge({ source }: { source: string }) {
  const labels: Record<string, string> = {
    website: 'Website',
    linkedin: 'LinkedIn',
    email: 'Email',
  }
  return (
    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{labels[source] || source}</span>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ApplicationTable({
  applications,
  onEdit,
  onDelete,
}: ApplicationTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Company
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Position
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Applied Date
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Response
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Job Type
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Applied Through
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Comments
              </th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {applications.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {app.company_name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{app.position}</td>
                <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                  {formatDate(app.application_date)}
                </td>
                <td className="px-5 py-3.5">
                  <ResponseBadge received={app.response_received} outcome={app.response_outcome} />
                </td>
                <td className="px-5 py-3.5">
                  <JobTypeBadge type={app.job_type} />
                </td>
                <td className="px-5 py-3.5">
                  <SourceBadge source={app.application_source} />
                </td>
                <td className="px-5 py-3.5 max-w-xs">
                  {app.comments ? (
                    <span
                      className="text-gray-600 dark:text-gray-400 truncate block max-w-[220px]"
                      title={app.comments}
                    >
                      {app.comments}
                    </span>
                  ) : (
                    <span className="text-gray-300 dark:text-gray-600">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(app)}
                      aria-label={`Edit ${app.company_name}`}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit application"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(app.id)}
                      aria-label={`Delete ${app.company_name}`}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {applications.map((app) => (
          <div key={app.id} className="p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{app.company_name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{app.position}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onEdit(app)}
                  aria-label={`Edit ${app.company_name}`}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(app.id)}
                  aria-label={`Delete ${app.company_name}`}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ResponseBadge received={app.response_received} outcome={app.response_outcome} />
              <JobTypeBadge type={app.job_type} />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(app.application_date)}</span>
              <span>•</span>
              <SourceBadge source={app.application_source} />
            </div>
            {app.comments && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 bg-gray-50 dark:bg-gray-800/40 p-2 rounded-lg">
                {app.comments}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
