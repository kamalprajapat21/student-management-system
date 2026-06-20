import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { aiAPI } from '../../services/api'
import { Brain, TrendingUp, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'

export default function AIInsights() {
  const { user } = useAuth()
  const [perf, setPerf] = useState(null)
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([aiAPI.performance(user.id), aiAPI.recommendations(user.id)])
      .then(([p, r]) => { setPerf(p.data); setRecs(r.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user.id])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const levelColors = { low: 'green', medium: 'yellow', high: 'red' }
  const predColors = { Excellent: 'text-green-600', Good: 'text-blue-600', Average: 'text-yellow-600', Weak: 'text-red-600' }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Performance Insights</h1>
      {perf && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Performance Prediction</h2>
              <p className={`text-2xl font-bold ${predColors[perf.prediction]}`}>{perf.prediction}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Attendance', value: `${perf.attendance_percentage}%`, color: perf.attendance_percentage >= 75 ? 'green' : 'red' },
              { label: 'Average Marks', value: `${perf.average_marks}%`, color: perf.average_marks >= 60 ? 'green' : 'red' },
              { label: 'Assignments', value: `${perf.assignment_completion}%`, color: perf.assignment_completion >= 75 ? 'green' : 'yellow' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
                <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-${color}-500 rounded-full`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {recs && (
        <>
          {recs.warnings?.length > 0 && (
            <div className="card border-l-4 border-l-red-400">
              <h3 className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5" /> Warnings
              </h3>
              <ul className="space-y-2">
                {recs.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                    <span className="mt-0.5">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" /> AI Recommendations
            </h3>
            <div className="space-y-3">
              {recs.recommendations?.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
