import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, aiAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { UserCheck, BookMarked, ClipboardList, DollarSign, Brain, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
         LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState({ attendance: null, marks: null, assignments: null, fees: null })
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [att, marks, assign, fees, perfData] = await Promise.all([
          studentAPI.attendance(), studentAPI.marks(), studentAPI.assignments(),
          studentAPI.fees(), aiAPI.performance(user.id)
        ])
        setData({ attendance: att.data, marks: marks.data, assignments: assign.data, fees: fees.data })
        setPerf(perfData.data)
      } catch {}
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const att = data.attendance
  const submitted = data.assignments?.assignments?.filter(a => a.submitted).length || 0
  const total = data.assignments?.assignments?.length || 0
  const pendingFees = data.fees?.pending_amount || 0
  const pendingAssignments = (data.assignments?.assignments || []).filter(a => !a.submitted)

  const predColors = { Excellent: 'green', Good: 'blue', Average: 'yellow', Weak: 'red' }
  const predColor = predColors[perf?.prediction] || 'blue'

  const radarData = [
    { subject: 'Attend.', value: att?.percentage || 0 },
    { subject: 'Marks', value: data.marks?.marks?.[0] ? 70 : 0 },
    { subject: 'Tasks', value: total > 0 ? Math.round((submitted / total) * 100) : 0 },
  ]

  return (
    <div className="space-y-5 animate-page">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's your academic overview</p>
        </div>
        {perf?.prediction && (
          <span className={`badge badge-${predColor} text-xs`}>{perf.prediction}</span>
        )}
      </div>

      {/* Attendance warning */}
      {att?.percentage < 75 && (
        <div className="alert-warning flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Attendance Warning</p>
            <p className="text-sm mt-0.5 opacity-80">
              Your attendance ({att?.percentage}%) is below the required 75%. Attend more classes to avoid shortage.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Attendance"
          value={`${att?.percentage || 0}%`}
          icon={UserCheck}
          color={att?.percentage >= 75 ? 'green' : 'red'}
          subtitle={`${att?.present || 0}/${att?.total_classes || 0} classes`}
        />
        <StatCard title="Tasks Done" value={`${submitted}/${total}`} icon={ClipboardList} color="blue" subtitle="assignments" />
        <StatCard
          title="Pending Fees"
          value={`₹${pendingFees >= 1000 ? (pendingFees / 1000).toFixed(1) + 'K' : pendingFees}`}
          icon={DollarSign}
          color={pendingFees > 0 ? 'red' : 'green'}
        />
        <StatCard title="AI Prediction" value={perf?.prediction || 'N/A'} icon={Brain} color={predColor} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 500 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Recent Marks</h3>
          <div className="space-y-3">
            {(data.marks?.marks || []).slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.exam_title}</p>
                  <p className="text-xs text-gray-400">{m.exam_type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{m.marks_obtained}/{m.total_marks}</p>
                  <span className={`badge ${m.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>
                    {m.grade || `${m.percentage}%`}
                  </span>
                </div>
              </div>
            ))}
            {!data.marks?.marks?.length && (
              <p className="text-gray-400 dark:text-gray-500 text-sm text-center py-4">No marks recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Pending Assignments</h3>
          {pendingAssignments.length > 0 && (
            <span className="badge badge-yellow">{pendingAssignments.length} pending</span>
          )}
        </div>
        {pendingAssignments.length > 0 ? (
          <div className="space-y-2">
            {pendingAssignments.slice(0, 4).map(a => {
              const isOverdue = new Date(a.deadline) < new Date()
              return (
                <div key={a.id} className={`flex items-start justify-between p-3 rounded-xl gap-3 ${isOverdue ? 'bg-red-50/60 dark:bg-red-900/10' : 'bg-gray-50 dark:bg-gray-700/40'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className={`h-3 w-3 flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                      <p className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {isOverdue ? 'Overdue · ' : 'Due · '}{new Date(a.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`badge flex-shrink-0 ${isOverdue ? 'badge-red' : 'badge-yellow'}`}>
                    {isOverdue ? 'Overdue' : 'Pending'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 py-2">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">All assignments submitted!</span>
          </div>
        )}
      </div>
    </div>
  )
}


