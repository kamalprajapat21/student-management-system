import React, { useEffect, useState } from 'react'
import { studentAPI, analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { Users, TrendingUp, Award, AlertTriangle, Search } from 'lucide-react'

export default function TeacherAnalytics() {
  const [students, setStudents] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      studentAPI.list({ limit: 100 }),
      analyticsAPI.dashboard().catch(() => ({ data: null })),
      analyticsAPI.attendanceTrend().catch(() => ({ data: { trend: [] } })),
    ]).then(([sRes, aRes, tRes]) => {
      setStudents(sRes.data.students || [])
      setAnalytics(aRes.data)
      setTrend((tRes.data.trend || []).slice().reverse().slice(-14))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  )

  const deptData = Object.entries(students.reduce((acc, s) => {
    acc[s.department || 'Other'] = (acc[s.department || 'Other'] || 0) + 1
    return acc
  }, {})).map(([name, value]) => ({ name, value }))

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

  const gradeData = analytics?.grade_distribution
    ? Object.entries(analytics.grade_distribution).map(([grade, count]) => ({ grade, count }))
    : []

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Student performance and class insights</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: students.length, icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
          { label: 'Attendance %', value: analytics ? `${analytics.attendance_percentage}%` : '—', icon: TrendingUp, bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Assignments', value: analytics?.total_assignments || 0, icon: Award, bg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
          { label: 'Departments', value: deptData.length, icon: AlertTriangle, bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {trend.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Attendance Trend (14 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {deptData.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">By Department</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deptData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name.slice(0, 6)}: ${(percent * 100).toFixed(0)}%`}>
                  {deptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {gradeData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Student list */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Student List</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input pl-9 w-52" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                {['Name', 'Roll No', 'Class', 'Department', 'Semester'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                        {s.full_name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="text-gray-500">{s.roll_number}</td>
                  <td>{s.class_name || '—'}</td>
                  <td>{s.department || '—'}</td>
                  <td>{s.semester ? `Sem ${s.semester}` : '—'}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
