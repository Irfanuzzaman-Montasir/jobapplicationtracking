'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Moon, Sun, Download, Search, ChevronUp, ChevronDown, Filter, X, Info, LogOut, User } from 'lucide-react'
import { Application, ApplicationFormData, FilterState, UserProfile } from '@/types'
import { getApplications, createApplication, updateApplication, deleteApplication } from '@/lib/api'
import { isSupabaseConfigured } from '@/lib/supabase'
import { getCurrentUser, signOutUser } from '@/lib/auth'
import StatCard from '@/components/StatCard'
import ApplicationTable from '@/components/ApplicationTable'
import ApplicationModal from '@/components/ApplicationModal'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import EmptyState from '@/components/EmptyState'
import AuthForm from '@/components/AuthForm'

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [showConfigNotice, setShowConfigNotice] = useState(true)

  const isConfigured = isSupabaseConfigured()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    response: 'all',
    jobType: 'all',
    source: 'all',
    sortOrder: 'desc',
  })

  // Theme setup
  useEffect(() => {
    const isDark =
      localStorage.getItem('jobtrack-theme') === 'dark' ||
      (!localStorage.getItem('jobtrack-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDark) {
      document.documentElement.classList.add('dark')
      requestAnimationFrame(() => {
        setDarkMode(true)
      })
    }
  }, [])

  const toggleDarkMode = () => {
    const isCurrentlyDark = document.documentElement.classList.contains('dark')
    if (isCurrentlyDark) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('jobtrack-theme', 'light')
      setDarkMode(false)
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('jobtrack-theme', 'dark')
      setDarkMode(true)
    }
  }

  // Check current session
  useEffect(() => {
    let ignore = false
    getCurrentUser()
      .then((user) => {
        if (!ignore) {
          setCurrentUser(user)
          setAuthChecked(true)
        }
      })
      .catch(() => {
        if (!ignore) {
          setCurrentUser(null)
          setAuthChecked(true)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  // Fetch applications when user changes
  useEffect(() => {
    if (!currentUser) return

    let ignore = false
    getApplications()
      .then((data) => {
        if (!ignore) {
          setApplications(data)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = err instanceof Error ? err.message : 'Failed to load applications'
          setError(`${msg}. Please check your database setup.`)
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [currentUser])

  const handleSignOut = async () => {
    await signOutUser()
    setCurrentUser(null)
    setApplications([])
  }

  // Stats
  const stats = useMemo(() => {
    const total = applications.length
    const responded = applications.filter((a) => a.response_received).length
    const noResponse = total - responded
    const positive = applications.filter((a) => a.response_outcome === 'positive').length
    return { total, responded, noResponse, positive }
  }, [applications])

  // Filtered & sorted applications
  const filteredApplications = useMemo(() => {
    let result = [...applications]

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim()
      result = result.filter(
        (a) =>
          a.company_name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q)
      )
    }

    if (filters.response !== 'all') {
      result = result.filter((a) =>
        filters.response === 'yes' ? a.response_received : !a.response_received
      )
    }

    if (filters.jobType !== 'all') {
      result = result.filter((a) => a.job_type === filters.jobType)
    }

    if (filters.source !== 'all') {
      result = result.filter((a) => a.application_source === filters.source)
    }

    result.sort((a, b) => {
      const timeA = new Date(a.application_date).getTime()
      const timeB = new Date(b.application_date).getTime()
      return filters.sortOrder === 'asc' ? timeA - timeB : timeB - timeA
    })

    return result
  }, [applications, filters])

  // Handlers
  const handleAdd = () => {
    setEditingApplication(null)
    setModalOpen(true)
  }

  const handleEdit = (app: Application) => {
    setEditingApplication(app)
    setModalOpen(true)
  }

  const handleDeleteRequest = (id: string) => {
    setDeletingId(id)
    setDeleteModalOpen(true)
  }

  const handleSubmit = async (formData: ApplicationFormData) => {
    setSubmitting(true)
    try {
      if (editingApplication) {
        const updated = await updateApplication(editingApplication.id, formData)
        setApplications((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        )
      } else {
        const created = await createApplication(formData)
        setApplications((prev) => [created, ...prev])
      }
      setModalOpen(false)
    } catch (err) {
      console.error(err)
      alert('Failed to save application. Please verify your Supabase setup or network connection.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await deleteApplication(deletingId)
      setApplications((prev) => prev.filter((a) => a.id !== deletingId))
      setDeleteModalOpen(false)
      setDeletingId(null)
    } catch (err) {
      console.error(err)
      alert('Failed to delete application. Please try again.')
    }
  }

  // CSV Export
  const handleExport = () => {
    const headers = [
      'Company',
      'Position',
      'Applied Date',
      'Response',
      'Response Outcome',
      'Job Type',
      'Applied Through',
      'Comments',
    ]
    const rows = filteredApplications.map((a) => [
      `"${a.company_name.replace(/"/g, '""')}"`,
      `"${a.position.replace(/"/g, '""')}"`,
      a.application_date,
      a.response_received ? 'Yes' : 'No',
      a.response_outcome,
      a.job_type,
      a.application_source,
      `"${(a.comments || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `JobTrack_Applications_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const toggleSort = () => {
    setFilters((f) => ({ ...f, sortOrder: f.sortOrder === 'asc' ? 'desc' : 'asc' }))
  }

  const hasActiveFilters =
    Boolean(filters.search) || filters.response !== 'all' || filters.jobType !== 'all' || filters.source !== 'all'

  const clearFilters = () => {
    setFilters({ search: '', response: 'all', jobType: 'all', source: 'all', sortOrder: filters.sortOrder })
  }

  // Initial Auth Loading Screen
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 dark:text-gray-400">Loading JobTrack...</span>
        </div>
      </div>
    )
  }

  // Not logged in: Full split-screen login page matching design
  if (!currentUser) {
    return (
      <AuthForm
        onSuccess={(user) => {
          setLoading(true)
          setCurrentUser(user)
        }}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">JT</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  JobTrack
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  Personal Job Application Tracker
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                disabled={filteredApplications.length === 0}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Export applications to CSV"
              >
                <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Application</span>
              </button>

              <button
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-transparent dark:border-gray-800"
                title="Toggle light/dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="flex items-center pl-2 ml-1 border-l border-gray-200 dark:border-gray-800 gap-2">
                <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>@{currentUser.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Notice for Supabase configuration */}
          {!isConfigured && showConfigNotice && (
            <div className="flex items-start justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
              <div className="flex items-start gap-2.5">
                <Info className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold">Supabase is not configured yet</p>
                  <p className="mt-0.5 text-amber-700 dark:text-amber-400">
                    Running in local demo mode with local session support. To connect to Supabase PostgreSQL, add your credentials in <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono">.env.local</code>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigNotice(false)}
                className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 p-1 rounded"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Section 1: Dashboard - 4 statistic cards in ONE horizontal row */}
          <section aria-label="Dashboard Statistics">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Applications"
                value={stats.total}
                loading={loading}
                color="blue"
              />
              <StatCard
                label="Responded"
                value={stats.responded}
                loading={loading}
                color="green"
              />
              <StatCard
                label="No Response"
                value={stats.noResponse}
                loading={loading}
                color="yellow"
              />
              <StatCard
                label="Positive Responses"
                value={stats.positive}
                loading={loading}
                color="purple"
              />
            </div>
          </section>

          {/* Section 2: Application Table with Search & Filters */}
          <section aria-label="Applications Management" className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by company name or position..."
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="hidden sm:flex items-center text-gray-400 text-xs gap-1 mr-1">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filters:</span>
                  </div>

                  <select
                    value={filters.response}
                    onChange={(e) => setFilters((f) => ({ ...f, response: e.target.value }))}
                    className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  >
                    <option value="all">All Responses</option>
                    <option value="yes">Responded</option>
                    <option value="no">No Response</option>
                  </select>

                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters((f) => ({ ...f, jobType: e.target.value }))}
                    className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  >
                    <option value="all">All Job Types</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>

                  <select
                    value={filters.source}
                    onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
                    className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  >
                    <option value="all">All Sources</option>
                    <option value="website">Website</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="email">Email</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Clear all filters"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}

                  <button
                    onClick={toggleSort}
                    className="inline-flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white px-2.5 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Sort by applied date"
                  >
                    <span>Date</span>
                    {filters.sortOrder === 'asc' ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sub-bar showing count & mobile CSV button */}
              {!loading && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Showing {filteredApplications.length} of {applications.length} applications
                    {hasActiveFilters ? ' (filtered)' : ''}
                  </span>
                  <button
                    onClick={handleExport}
                    disabled={filteredApplications.length === 0}
                    className="sm:hidden inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 disabled:opacity-40"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </div>
              )}
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-16 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">Loading your applications...</span>
                </div>
              </div>
            ) : filteredApplications.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onAdd={handleAdd}
                onClear={clearFilters}
              />
            ) : (
              <ApplicationTable
                applications={filteredApplications}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
              />
            )}
          </section>
        </main>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <ApplicationModal
          application={editingApplication}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmModal
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteModalOpen(false)
            setDeletingId(null)
          }}
        />
      )}
    </div>
  )
}
