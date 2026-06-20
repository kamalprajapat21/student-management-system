import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function Fees() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    studentAPI.fees().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pieData = [
    { name: 'Paid', value: data?.paid_amount || 0 },
    { name: 'Pending', value: data?.pending_amount || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Status</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{(data?.total_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Total Amount</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">₹{(data?.paid_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Paid</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">₹{(data?.pending_amount || 0).toLocaleString()}</p>
          <p className="text-gray-500">Pending</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name, percent}) => `${name}: ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={['#22c55e', '#ef4444'][i]} />)}
              </Pie>
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-4">Fee Records</h3>
          <div className="space-y-3">
            {(data?.fees || []).map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{f.fee_type}</p>
                  <p className="text-xs text-gray-500">Due: {new Date(f.due_date).toLocaleDateString()}</p>
                  {f.payment_date && <p className="text-xs text-green-600">Paid: {new Date(f.payment_date).toLocaleDateString()}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{f.amount.toLocaleString()}</p>
                  <span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
