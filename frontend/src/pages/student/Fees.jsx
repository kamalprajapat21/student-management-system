import React, { useEffect, useState } from 'react'
import { studentAPI } from '../../services/api'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, CheckCircle, Clock, AlertTriangle, CreditCard } from 'lucide-react'

const statusBadge = { paid: 'badge-green', unpaid: 'badge-yellow', overdue: 'badge-red' }
const statusIcon = {
  paid: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  unpaid: <Clock className="h-4 w-4 text-yellow-500" />,
  overdue: <AlertTriangle className="h-4 w-4 text-red-500" />,
}

export default function Fees() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    studentAPI.fees().then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
    </div>
  )

  const allFees = data?.fees || []
  const filtered = filter === 'all' ? allFees : allFees.filter(f => f.status === filter)

  const pieData = [
    { name: 'Paid', value: data?.paid_amount || 0 },
    { name: 'Pending', value: data?.pending_amount || 0 },
  ]
  const total = data?.total_amount || 0
  const paidPct = total > 0 ? Math.round(((data?.paid_amount || 0) / total) * 100) : 0

  return (
    <div className="space-y-5 animate-page">
      <div>
        <h1 className="page-title">Fee Status</h1>
        <p className="page-subtitle">View and track your fee payments</p>
      </div>

      {/* Warning */}
      {(data?.pending_amount || 0) > 0 && (
        <div className="alert-warning flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">Pending Fees</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">You have ₹{(data?.pending_amount || 0).toLocaleString()} in outstanding fees. Please clear them before the due date.</p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Total Amount', value: `₹${(data?.total_amount || 0).toLocaleString()}`, icon: DollarSign, bg: 'bg-gray-100 dark:bg-gray-700', iconColor: 'text-gray-600 dark:text-gray-300' },
          { label: 'Amount Paid', value: `₹${(data?.paid_amount || 0).toLocaleString()}`, icon: CheckCircle, bg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600' },
          { label: 'Pending', value: `₹${(data?.pending_amount || 0).toLocaleString()}`, icon: Clock, bg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600' },
        ].map(({ label, value, icon: Icon, bg, iconColor }) => (
          <div key={label} className="card card-hover flex items-center gap-4 p-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} flex-shrink-0`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Progress */}
      {total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card flex flex-col items-center justify-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide self-start">Payment Summary</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Paid</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Pending</span>
            </div>
          </div>
          <div className="card lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">Payment Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Overall completion</span>
                <span className="font-bold text-emerald-600">{paidPct}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${paidPct}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {allFees.reduce((acc, f) => {
                if (!acc[f.fee_type]) acc[f.fee_type] = { type: f.fee_type, total: 0, paid: 0 }
                acc[f.fee_type].total += f.amount
                if (f.status === 'paid') acc[f.fee_type].paid += f.amount
                return acc
              }, {}) && Object.values(allFees.reduce((acc, f) => {
                if (!acc[f.fee_type]) acc[f.fee_type] = { type: f.fee_type, total: 0, paid: 0 }
                acc[f.fee_type].total += f.amount
                if (f.status === 'paid') acc[f.fee_type].paid += f.amount
                return acc
              }, {})).map(({ type, total: t, paid: p }) => (
                <div key={type} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{type}</p>
                  <p className="font-bold text-sm text-gray-900 dark:text-white mt-1">₹{p.toLocaleString()}<span className="text-gray-400 font-normal"> / ₹{t.toLocaleString()}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fee Records */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">Fee Records</h3>
          <div className="flex gap-2">
            {['all', 'paid', 'unpaid', 'overdue'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filtered.map(f => (
            <div key={f.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-100 dark:border-gray-600">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${f.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30' : f.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                <CreditCard className={`h-5 w-5 ${f.status === 'paid' ? 'text-emerald-600' : f.status === 'overdue' ? 'text-red-600' : 'text-amber-600'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{f.fee_type}</p>
                <p className="text-xs text-gray-500">Due: {new Date(f.due_date).toLocaleDateString()}</p>
                {f.payment_date && <p className="text-xs text-emerald-600">Paid: {new Date(f.payment_date).toLocaleDateString()}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">₹{f.amount.toLocaleString()}</p>
                <span className={`badge mt-1 ${statusBadge[f.status] || 'badge-yellow'}`}>{f.status}</span>
              </div>
              <div className="flex-shrink-0">{statusIcon[f.status]}</div>
            </div>
          ))}
          {!filtered.length && (
            <div className="py-12 text-center">
              <DollarSign className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500">No fee records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
