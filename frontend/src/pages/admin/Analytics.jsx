import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Users, GraduationCap, TrendingUp, DollarSign, ClipboardList, Award } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.attendanceTrend()])
      .then(([d, t]) => {
        setData(d.data)
        setTrend((t.data.trend || []).slice().reverse().slice(-14))
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const gradeData = Object.entries(data?.grade_distribution || {}).map(([grade, count]) => ({ grade, count }))
  const feeData = [
    { name: 'Collected', value: data?.paid_fee_amount || 0 },
    { name: 'Pending', value: data?.pending_fee_amount || 0 },
  ]

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Analytics &amp; Reports</h1>
        <p className="page-subtitle">School-wide performance and financial overview</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Students', value: data?.total_students, icon: GraduationCap, bg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600' },
          { label: 'Total Teachers', value: data?.total_teachers, icon: Users, bg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600' },
          { label: 'Attendance %', value: `${data?.attendance_percentage || 0}%`, icon: TrendingUp, bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Total Assignments', value: data?.total_assignments, icon: ClipboardList, bg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600' },
          { label: 'Total Fee', value: `₹${(data?.total_fee_amount || 0).toLocaleString()}`, icon: DollarSign, bg: 'bg-rose-100 dark:bg-rose-900/30', iconColor: 'text-rose-600' },
          { label: 'Collected', value: `₹${(data?.paid_fee_amount || 0).toLocaleString()}`, icon: Award, bg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600' },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="card card-hover flex items-center gap-3 p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{value ?? '—'}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {trend.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Attendance Trend (14 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Fee Collection</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value">
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 justify-center mt-1 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Collected</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Pending</span>
          </div>
        </div>
      </div>

      {/* Grade distribution */}
      {gradeData.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {gradeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
