import React, { useEffect, useState } from 'react'
import { studentAPI, attendanceAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function TeacherAnalytics() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.list({ limit: 100 }).then(r => { setStudents(r.data.students || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
      <div className="card">
        <h3 className="font-semibold mb-4">Student Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center"><p className="text-3xl font-bold text-primary-600">{students.length}</p><p className="text-sm text-gray-500">Total Students</p></div>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Students List</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Roll No', 'Class', 'Department'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-2 pr-4 text-gray-500">{s.roll_number}</td>
                  <td className="py-2 pr-4">{s.class_name}</td>
                  <td className="py-2">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
