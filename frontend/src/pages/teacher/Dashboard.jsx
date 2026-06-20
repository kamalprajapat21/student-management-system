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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.full_name} 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Teacher Dashboard</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="blue" />
        <StatCard title="My Assignments" value={stats.assignments} icon={ClipboardList} color="purple" />
        <StatCard title="Present Today" value={stats.todayAttendance} icon={UserCheck} color="green" />
      </div>
      <div className="card">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Mark Attendance', '/teacher/attendance', 'green'],
            ['Create Assignment', '/teacher/assignments', 'blue'],
            ['Add Marks', '/teacher/marks', 'purple'],
            ['View Analytics', '/teacher/analytics', 'orange'],
          ].map(([label, to, color]) => (
            <a key={to} href={to} className={`p-3 bg-${color}-50 dark:bg-${color}-900/20 rounded-xl text-center hover:scale-105 transition-transform`}>
              <p className={`font-medium text-sm text-${color}-700 dark:text-${color}-300`}>{label}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
