import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, assignmentAPI, attendanceAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { GraduationCap, ClipboardList, UserCheck, BarChart3 } from 'lucide-react'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ students: 0, assignments: 0, todayAttendance: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentAPI.list().catch(() => ({ data: { total: 0 } })),
      assignmentAPI.list().catch(() => ({ data: { assignments: [] } })),
      attendanceAPI.overview().catch(() => ({ data: { present: 0 } })),
    ]).then(([students, assignments, att]) => {
      setStats({
        students: students.data.total || 0,
        assignments: assignments.data.assignments?.filter(a => a.teacher_id === user.id).length || 0,
        todayAttendance: att.data.present || 0,
      })
    }).finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Welcome, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Teacher Dashboard</p>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="blue" />
        <StatCard title="Assignments" value={stats.assignments} icon={ClipboardList} color="purple" />
        <StatCard title="Present Today" value={stats.todayAttendance} icon={UserCheck} color="green" />
      </div>
      <div className="card">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Mark Attendance', to: '/teacher/attendance', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300' },
            { label: 'Create Assignment', to: '/teacher/assignments', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300' },
            { label: 'Add Marks', to: '/teacher/marks', bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300' },
            { label: 'View Analytics', to: '/teacher/analytics', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300' },
          ].map(({ label, to, bg, text }) => (
            <a key={to} href={to} className={`p-4 ${bg} rounded-2xl text-center hover:scale-[1.03] active:scale-95 transition-all duration-200 border border-white/50 dark:border-white/5`}>
              <p className={`font-semibold text-sm ${text}`}>{label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
