import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { parentAPI } from '../../services/api'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import StatCard from '../../components/common/StatCard'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import {
  GraduationCap, UserCheck, BookMarked, DollarSign,
  Bell, FileText, TrendingUp, AlertTriangle
} from 'lucide-react'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b']

export default function ParentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    parentAPI.dashboard()
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <FullPageLoader />

  if (!data?.child) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.full_name}
        </h1>
        <div className="card text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{data?.message || 'No child linked to your account.'}</p>
          <p className="text-gray-400 text-sm mt-2">Please contact the school administrator.</p>
        </div>
      </div>
    )
  }

  const { child, attendance, marks, fees, notices, leaves } = data

  const attChartData = [
    { name: 'Present', value: attendance.present },
    { name: 'Absent', value: attendance.absent },
  ]

  const marksChartData = marks.records.slice(0, 8).map(m => ({
    name: m.exam_title.length > 12 ? m.exam_title.slice(0, 12) + '…' : m.exam_title,
    percentage: m.percentage,
  }))

  const feeChartData = [
    { name: 'Paid', value: fees.paid },
    { name: 'Unpaid', value: fees.unpaid },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Parent Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tracking progress of {child.name}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          attendance.percentage >= 75
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {attendance.percentage >= 75 ? '✓ Attendance OK' : '⚠ Low Attendance'}
        </div>
      </div>

      {/* Child Info Card */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{child.name}</h2>
            <p className="text-gray-500 text-sm">{child.email}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              {child.roll_number && (
                <span className="badge badge-blue">Roll: {child.roll_number}</span>
              )}
              {child.class_name && (
                <span className="badge badge-blue">Class: {child.class_name}</span>
              )}
              {child.section && (
                <span className="badge badge-blue">Section: {child.section}</span>
              )}
              {child.department && (
                <span className="badge badge-blue">{child.department}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendance.percentage}%`}
          subtitle={`${attendance.present}/${attendance.total_classes} classes`}
          icon={UserCheck}
          color={attendance.percentage >= 75 ? 'green' : 'red'}
        />
        <StatCard
          title="Avg. Score"
          value={`${marks.average_percentage}%`}
          subtitle={`${marks.records.length} exams taken`}
          icon={BookMarked}
          color="blue"
        />
        <StatCard
          title="Fees Paid"
          value={`₹${fees.paid.toLocaleString()}`}
          subtitle={`₹${fees.unpaid.toLocaleString()} pending`}
          icon={DollarSign}
          color={fees.unpaid > 0 ? 'yellow' : 'green'}
        />
        <StatCard
          title="Leave Requests"
          value={leaves.length}
          subtitle="recent leaves"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Pie */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-primary-600" /> Attendance
          </h3>
          {attendance.total_classes > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={attChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No attendance records</p>
          )}
        </div>

        {/* Marks Bar Chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary-600" /> Exam Performance
          </h3>
          {marksChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={marksChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No exam records</p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Status */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary-600" /> Fee Status
          </h3>
          {fees.records.length > 0 ? (
            <div className="space-y-2">
              {fees.records.slice(0, 5).map(f => (
                <div key={f.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{f.fee_type}</p>
                    <p className="text-gray-400 text-xs">
                      Due: {f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">₹{f.amount.toLocaleString()}</p>
                    <span className={`badge text-xs ${
                      f.status === 'paid' ? 'badge-green' :
                      f.status === 'overdue' ? 'badge-red' : 'badge-yellow'
                    }`}>{f.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No fee records</p>
          )}
        </div>

        {/* Recent Notices */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-600" /> Recent Notices
          </h3>
          {notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map(n => (
                <div key={n.id} className="border-l-2 border-primary-500 pl-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No notices</p>
          )}
        </div>

        {/* Recent Leaves */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-600" /> Leave Applications
          </h3>
          {leaves.length > 0 ? (
            <div className="space-y-2">
              {leaves.map(lv => (
                <div key={lv.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{lv.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(lv.from_date).toLocaleDateString()} – {new Date(lv.to_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge text-xs ${
                    lv.status === 'approved' ? 'badge-green' :
                    lv.status === 'rejected' ? 'badge-red' : 'badge-yellow'
                  }`}>{lv.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-6">No leave applications</p>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(attendance.percentage < 75 || fees.unpaid > 0) && (
        <div className="card border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-400">Action Required</h4>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 mt-1 space-y-1">
                {attendance.percentage < 75 && (
                  <li>{child.name}'s attendance is {attendance.percentage}% (below 75% threshold)</li>
                )}
                {fees.unpaid > 0 && (
                  <li>Pending fees of ₹{fees.unpaid.toLocaleString()} — please clear before due date</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
