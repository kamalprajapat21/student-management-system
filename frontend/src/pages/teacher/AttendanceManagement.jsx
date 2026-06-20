import React, { useEffect, useState } from 'react'
import { studentAPI, attendanceAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function AttendanceManagement() {
  const [students, setStudents] = useState([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    studentAPI.list({ limit: 100 }).then(r => {
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
      toast.success('Attendance marked successfully!')
    } catch {
      toast.error('Failed to mark attendance')
    } finally {
      setLoading(false)
    }
  }

  const setAll = (status) => {
    const all = {}
    students.forEach(s => { all[s.id] = status })
    setAttendance(all)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
      <div className="card">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input w-auto" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setAll('present')} className="btn-secondary text-sm">All Present</button>
            <button onClick={() => setAll('absent')} className="btn-secondary text-sm">All Absent</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 pr-4">Student</th>
              <th className="text-left py-2 pr-4">Roll No</th>
              <th className="text-left py-2">Status</th>
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.roll_number}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      {['present', 'absent', 'late'].map(status => (
                        <button key={status}
                          onClick={() => setAttendance(prev => ({...prev, [s.id]: status}))}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            attendance[s.id] === status
                              ? status === 'present' ? 'bg-green-500 text-white'
                                : status === 'absent' ? 'bg-red-500 text-white'
                                : 'bg-yellow-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                          }`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={save} disabled={loading} className="btn-primary px-8">{loading ? 'Saving...' : 'Save Attendance'}</button>
        </div>
      </div>
    </div>
  )
}
