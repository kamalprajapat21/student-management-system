import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { BookOpen, TrendingUp, Award, Target, CheckCircle, XCircle } from 'lucide-react'

const gradeColor = (pct) => {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 75) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}
const gradeBadge = (pct) => {
  if (pct >= 90) return 'badge-green'
  if (pct >= 75) return 'badge-blue'
  if (pct >= 60) return 'badge-yellow'
  return 'badge-red'
}

export default function Exams() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    studentAPI.marks()
      .then(r => { setMarks(r.data.marks || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const types = ['all', ...new Set(marks.map(m => m.exam_type))]
  const filtered = filter === 'all' ? marks : marks.filter(m => m.exam_type === filter)
  const avg = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0
  const highest = marks.length ? Math.max(...marks.map(m => m.percentage)) : 0
  const passed = marks.filter(m => m.percentage >= 60).length

  const chartData = filtered.slice(-10).map(m => ({
    name: m.exam_title.length > 10 ? m.exam_title.slice(0, 10) + '…' : m.exam_title,
    pct: m.percentage,
  }))

  const radarData = Object.entries(
    marks.reduce((acc, m) => {
      const type = m.exam_type || 'Other'
      if (!acc[type]) acc[type] = { sum: 0, count: 0 }
      acc[type].sum += m.percentage
      acc[type].count++
      return acc
    }, {})
  ).map(([type, { sum, count }]) => ({ subject: type, A: Math.round(sum / count) }))

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Marks &amp; Exams</h1>
        <p className="page-subtitle">Track your academic performance across all exams</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Exams', value: marks.length, icon: BookOpen, bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
          { label: 'Average Score', value: `${avg}%`, icon: TrendingUp, bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Best Score', value: `${highest}%`, icon: Award, bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
          { label: 'Pass Rate', value: marks.length ? `${Math.round((passed / marks.length) * 100)}%` : '—', icon: Target, bg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="card card-hover flex items-center gap-3 p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {marks.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Score Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="pct" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {radarData.length >= 3 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">By Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <Radar dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Tooltip formatter={v => `${v}%`} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">All Results</h3>
          <div className="flex flex-wrap gap-2">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === t ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {['Exam', 'Type', 'Score', 'Percentage', 'Grade', 'Status'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={i}>
                  <td><p className="font-medium text-gray-900 dark:text-white">{m.exam_title}</p></td>
                  <td><span className="capitalize text-gray-500 text-xs">{m.exam_type}</span></td>
                  <td className="font-medium">{m.marks_obtained}<span className="text-gray-400">/{m.total_marks}</span></td>
                  <td><span className={`font-bold ${gradeColor(m.percentage)}`}>{m.percentage}%</span></td>
                  <td><span className={`badge ${gradeBadge(m.percentage)}`}>{m.grade || 'N/A'}</span></td>
                  <td>
                    {m.percentage >= 60
                      ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                      : <XCircle className="h-4 w-4 text-red-500" />}
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="py-12 text-center">
                  <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500">No exam records yet.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
