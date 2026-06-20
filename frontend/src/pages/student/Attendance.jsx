import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function Attendance() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.attendance().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pieData = [
    { name: 'Present', value: data?.present || 0 },
    { name: 'Absent', value: data?.absent || 0 },
  ]
  const COLORS = ['#22c55e', '#ef4444']

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Attendance</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-4xl font-bold text-primary-600">{data?.percentage || 0}%</p>
          <p className="text-gray-500 mt-1">Overall Attendance</p>
          <div className={`mt-2 badge ${data?.percentage >= 75 ? 'badge-green' : 'badge-red'}`}>
            {data?.percentage >= 75 ? 'Good Standing' : 'Below Minimum'}
          </div>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-bold text-green-600">{data?.present || 0}</p>
          <p className="text-gray-500 mt-1">Classes Present</p>
        </div>
        <div className="card text-center">
          <p className="text-4xl font-bold text-red-600">{data?.absent || 0}</p>
          <p className="text-gray-500 mt-1">Classes Absent</p>
        </div>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Attendance Chart</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <h3 className="font-semibold mb-4">Attendance History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 text-gray-500">Date</th>
              <th className="text-left py-2 text-gray-500">Subject</th>
              <th className="text-left py-2 text-gray-500">Status</th>
            </tr></thead>
            <tbody>
              {(data?.records || []).slice(0, 30).map((r, i) => (
                <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="py-2 text-gray-500">{r.subject_id ? `Subject ${r.subject_id}` : 'General'}</td>
                  <td className="py-2">
                    <span className={`badge ${r.status === 'present' ? 'badge-green' : r.status === 'late' ? 'badge-yellow' : 'badge-red'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
