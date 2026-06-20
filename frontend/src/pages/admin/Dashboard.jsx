import React, { useEffect, useState } from 'react'
import { analyticsAPI } from '../../services/api'
import StatCard from '../../components/common/StatCard'
import { GraduationCap, Users, DollarSign, UserCheck, BarChart3, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
         BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([analyticsAPI.dashboard(), analyticsAPI.attendanceTrend()])
      .then(([d, t]) => { setData(d.data); setTrend(t.data.trend?.slice().reverse() || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const gradeData = Object.entries(data?.grade_distribution || {}).map(([grade, count]) => ({ grade, count }))
  const feeData = [
    { name: 'Paid', value: data?.paid_fee_amount || 0 },
    { name: 'Pending', value: data?.pending_fee_amount || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data?.total_students || 0} icon={GraduationCap} color="blue" />
        <StatCard title="Total Teachers" value={data?.total_teachers || 0} icon={Users} color="purple" />
        <StatCard title="Attendance Rate" value={`${data?.attendance_percentage || 0}%`} icon={UserCheck} color="green" />
        <StatCard title="Fee Collection" value={`₹${((data?.paid_fee_amount || 0) / 1000).toFixed(0)}K`} icon={DollarSign} color="orange" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trend.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Collection</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                {feeData.map((_, i) => <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {gradeData.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-semibold mb-4">Grade Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
