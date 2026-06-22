import React from 'react'

const colorMap = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20',
    icon: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-200 dark:shadow-blue-900',
    text: 'text-blue-600 dark:text-blue-400',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20',
    icon: 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-emerald-200 dark:shadow-emerald-900',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
    icon: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200 dark:shadow-red-900',
    text: 'text-red-600 dark:text-red-400',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
    icon: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-purple-200 dark:shadow-purple-900',
    text: 'text-purple-600 dark:text-purple-400',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20',
    icon: 'bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-amber-200 dark:shadow-amber-900',
    text: 'text-amber-600 dark:text-amber-400',
  },
  orange: {
    bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20',
    icon: 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-orange-200 dark:shadow-orange-900',
    text: 'text-orange-600 dark:text-orange-400',
  },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }) {
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={`card-hover ${c.bg} border-0`}>
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={`p-3 rounded-2xl shadow-md flex-shrink-0 ${c.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
