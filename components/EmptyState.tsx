'use client'

import { Plus, FilterX } from 'lucide-react'

interface EmptyStateProps {
  hasFilters: boolean
  onAdd: () => void
  onClear: () => void
}

export default function EmptyState({ hasFilters, onAdd, onClear }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <FilterX className="w-6 h-6 text-gray-400 dark:text-gray-500" />
        </div>
        <div>
          <p className="text-gray-900 dark:text-white font-medium">No matching applications</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try adjusting your search or filters.
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all filters
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg font-bold">JT</span>
        </div>
      </div>
      <div>
        <p className="text-gray-900 dark:text-white font-semibold text-lg">
          Start tracking your applications
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
          Add your first job application to get started. You can track the status, type, and
          outcome of each application.
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Your First Application
      </button>
    </div>
  )
}
