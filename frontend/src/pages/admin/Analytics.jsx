import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.attendanceTrend()])
      .then(([d, t]) => { setData(d.data); setTrend(t.data.trend?.slice().reverse() || []) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const gradeData = Object.entries(data?.grade_distribution || {}).map(([grade, count]) => ({ grade, count }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">30-Day Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total Students', data?.total_students, 'blue'],
          ['Total Teachers', data?.total_teachers, 'purple'],
          ['Attendance %', `${data?.attendance_percentage}%`, 'green'],
          ['Total Assignments', data?.total_assignments, 'orange'],
        ].map(([label, value, color]) => (
          <div key={label} className={`card text-center bg-${color}-50 dark:bg-${color}-900/20`}>
            <p className={`text-3xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
