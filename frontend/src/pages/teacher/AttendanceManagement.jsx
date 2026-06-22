import React, { useEffect, useState } from 'react'
import { studentAPI, attendanceAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, UserCheck, Users, ChevronDown, Save } from 'lucide-react'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-emerald-500 text-white', inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700', icon: CheckCircle },
  absent: { label: 'Absent', color: 'bg-red-500 text-white', inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700', icon: XCircle },
  late: { label: 'Late', color: 'bg-amber-500 text-white', inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700', icon: Clock },
}

export default function AttendanceManagement() {
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    studentAPI.list({ limit: 200 }).then(r => {
      const s = r.data.students || []
      setStudents(s)
      const defaults = {}
      s.forEach(st => { defaults[st.id] = 'present' })
      setAttendance(defaults)
    }).catch(() => {})
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({ student_id: Number(student_id), status }))
      await attendanceAPI.markBulk({ date, records })
      toast.success('Attendance saved successfully!')
    } catch {
      toast.error('Failed to save attendance')
    } finally {
      setLoading(false)
    }
  }

  const setAll = (status) => {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setAttendance(all)
    toast(`All students marked as ${status}`, { icon: '✓' })
  }

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = Object.values(attendance).reduce((acc, s) => {
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Mark Attendance</h1>
        <p className="page-subtitle">Record daily attendance for your class</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Present', count: counts.present || 0, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Absent', count: counts.absent || 0, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Late', count: counts.late || 0, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`card text-center p-4 ${bg}`}>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="flex-1 min-w-48">
            <label className="label">Search Students</label>
            <input className="input" placeholder="Search by name or roll no…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {['present', 'absent', 'late'].map(s => (
              <button key={s} onClick={() => setAll(s)}
                className={`btn-secondary text-xs capitalize flex items-center gap-1 ${s === 'present' ? 'hover:text-emerald-700' : s === 'absent' ? 'hover:text-red-700' : 'hover:text-amber-700'}`}>
                <Users className="h-3.5 w-3.5" /> All {s}
              </button>
            ))}
          </div>
        </div>

        {/* Student rows */}
        <div className="space-y-2">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-700 dark:text-primary-300 flex-shrink-0">
                {s.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{s.full_name}</p>
                <p className="text-xs text-gray-500">{s.roll_number} • {s.class_name}</p>
              </div>
              <div className="flex gap-1.5">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const isActive = attendance[s.id] === status
                  const Icon = cfg.icon
                  return (
                    <button
                      key={status}
                      onClick={() => setAttendance(prev => ({ ...prev, [s.id]: status }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 active:scale-95 ${isActive ? cfg.color : cfg.inactive}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {!filtered.length && (
            <p className="text-center text-gray-500 py-8">No students found.</p>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button onClick={save} disabled={loading}
            className="btn-primary flex items-center gap-2 px-8">
            <Save className="h-4 w-4" />
            {loading ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}
