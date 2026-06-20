import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Exams() {
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.marks().then(r => { setMarks(r.data.marks || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const avg = marks.length ? Math.round(marks.reduce((s, m) => s + m.percentage, 0) / marks.length) : 0
  const chartData = marks.map(m => ({ name: m.exam_title.substring(0, 12), marks: m.marks_obtained, total: m.total_marks }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks & Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center"><p className="text-4xl font-bold text-primary-600">{marks.length}</p><p className="text-gray-500">Total Exams</p></div>
        <div className="card text-center"><p className="text-4xl font-bold text-green-600">{avg}%</p><p className="text-gray-500">Average Score</p></div>
        <div className="card text-center"><p className="text-4xl font-bold text-blue-600">{marks.filter(m => m.percentage >= 60).length}</p><p className="text-gray-500">Passed</p></div>
      </div>
      {marks.length > 0 && (
        <div className="card">
          <h3 className="font-semibold mb-4">Marks Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="marks" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold mb-4">All Marks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Exam', 'Type', 'Marks', 'Percentage', 'Grade'].map(h => (
                <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4 font-medium">{m.exam_title}</td>
                  <td className="py-2 pr-4 text-gray-500 capitalize">{m.exam_type}</td>
                  <td className="py-2 pr-4">{m.marks_obtained}/{m.total_marks}</td>
                  <td className="py-2 pr-4">{m.percentage}%</td>
                  <td className="py-2"><span className={`badge ${m.percentage >= 60 ? 'badge-green' : 'badge-red'}`}>{m.grade || 'N/A'}</span></td>
                </tr>
              ))}
              {!marks.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No marks recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
