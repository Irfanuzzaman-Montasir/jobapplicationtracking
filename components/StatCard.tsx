'use client'

interface StatCardProps {
  label: string
  value: number
  loading: boolean
  color: 'blue' | 'green' | 'yellow' | 'purple'
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800/50',
    value: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800/50',
    value: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  yellow: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/50',
    value: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800/50',
    value: 'text-purple-700 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
}

export default function StatCard({ label, value, loading, color }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div
      className={`${c.bg} ${c.border} border rounded-xl p-4 flex flex-col gap-2`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      ) : (
        <span className={`text-3xl font-bold ${c.value}`}>{value}</span>
      )}
    </div>
  )
}
