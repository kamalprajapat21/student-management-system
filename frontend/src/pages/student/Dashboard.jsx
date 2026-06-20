import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, aiAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { UserCheck, BookMarked, ClipboardList, DollarSign, Brain, TrendingUp } from 'lucide-react'
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const att = data.attendance
  const submitted = data.assignments?.assignments?.filter(a => a.submitted).length || 0
  const total = data.assignments?.assignments?.length || 0
  const pendingFees = data.fees?.pending_amount || 0

  const predColors = { Excellent: 'green', Good: 'blue', Average: 'yellow', Weak: 'red' }
  const predColor = predColors[perf?.prediction] || 'blue'

  const radarData = [
    { subject: 'Attendance', value: att?.percentage || 0 },
    { subject: 'Avg Marks', value: data.marks?.marks?.[0] ? 70 : 0 },
    { subject: 'Assignments', value: total > 0 ? (submitted/total)*100 : 0 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.full_name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Here is your academic overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${att?.percentage || 0}%`} icon={UserCheck}
          color={att?.percentage >= 75 ? 'green' : 'red'}
          subtitle={`${att?.present || 0}/${att?.total_classes || 0} classes`} />
        <StatCard title="Assignments Done" value={`${submitted}/${total}`} icon={ClipboardList} color="blue" />
        <StatCard title="Pending Fees" value={`₹${pendingFees.toLocaleString()}`} icon={DollarSign}
          color={pendingFees > 0 ? 'red' : 'green'} />
        <StatCard title="AI Prediction" value={perf?.prediction || 'N/A'} icon={Brain} color={predColor} />
      </div>

      {att?.percentage < 75 && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="font-semibold text-red-800 dark:text-red-300">⚠ Attendance Warning</p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            Your attendance ({att?.percentage}%) is below the required 75%. Attend more classes to avoid shortage.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Marks</h3>
          <div className="space-y-3">
            {(data.marks?.marks || []).slice(0, 5).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{m.exam_title}</p>
                  <p className="text-xs text-gray-500">{m.exam_type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{m.marks_obtained}/{m.total_marks}</p>
                  <span className={`badge ${m.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>
                    {m.grade || `${m.percentage}%`}
                  </span>
                </div>
              </div>
            ))}
            {!data.marks?.marks?.length && <p className="text-gray-500 text-sm">No marks recorded yet.</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Pending Assignments</h3>
        <div className="space-y-2">
          {(data.assignments?.assignments || []).filter(a => !a.submitted).slice(0, 5).map(a => (
            <div key={a.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{a.title}</p>
                <p className="text-xs text-gray-500">Due: {new Date(a.deadline).toLocaleDateString()}</p>
              </div>
              <span className="badge badge-yellow">Pending</span>
            </div>
          ))}
          {!(data.assignments?.assignments || []).filter(a => !a.submitted).length &&
            <p className="text-green-600 dark:text-green-400 text-sm">All assignments submitted! 🎉</p>}
        </div>
      </div>
    </div>
  )
}
