import React, { useEffect, useState } from 'react'
import { feeAPI, studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus } from 'lucide-react'

export default function FeeManagement() {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ student_id: '', amount: '', fee_type: 'Tuition', due_date: '' })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')

  const load = () => {
    feeAPI.list(filter ? { status: filter } : {}).then(r => setFees(r.data.fees || [])).catch(() => {})
    feeAPI.stats().then(r => setStats(r.data)).catch(() => {})
  }
  useEffect(() => { load(); studentAPI.list({ limit: 200 }).then(r => setStudents(r.data.students || [])).catch(() => {}) }, [])
  useEffect(load, [filter])

  const create = async () => {
    if (!form.student_id || !form.amount || !form.due_date) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await feeAPI.create({ ...form, student_id: Number(form.student_id), amount: Number(form.amount) })
      toast.success('Fee record created!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const markPaid = async (id) => {
    await feeAPI.pay(id, { status: 'paid' })
    toast.success('Marked as paid')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Fee Record</button>
      </div>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center"><p className="text-3xl font-bold text-gray-900 dark:text-white">₹{stats.total?.toLocaleString()}</p><p className="text-gray-500">Total</p></div>
          <div className="card text-center"><p className="text-3xl font-bold text-green-600">₹{stats.paid?.toLocaleString()}</p><p className="text-gray-500">Collected</p></div>
          <div className="card text-center"><p className="text-3xl font-bold text-red-600">₹{stats.pending?.toLocaleString()}</p><p className="text-gray-500">Pending</p></div>
        </div>
      )}
      <div className="card">
        <div className="flex gap-2 mb-4">
          {['', 'paid', 'unpaid', 'overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${filter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Student', 'Type', 'Amount', 'Due Date', 'Status', 'Action'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {fees.map(f => (
                <tr key={f.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4">Student #{f.student_id}</td>
                  <td className="py-2 pr-4">{f.fee_type}</td>
                  <td className="py-2 pr-4 font-bold">₹{f.amount?.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4"><span className={`badge ${f.status === 'paid' ? 'badge-green' : f.status === 'overdue' ? 'badge-red' : 'badge-yellow'}`}>{f.status}</span></td>
                  <td className="py-2">
                    {f.status !== 'paid' && <button onClick={() => markPaid(f.id)} className="text-xs btn-primary py-1 px-3">Mark Paid</button>}
                  </td>
                </tr>
              ))}
              {!fees.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No fee records.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Fee Record">
        <div className="space-y-4">
          <div><label className="label">Student *</label>
            <select className="input" value={form.student_id} onChange={e => setForm(p => ({...p, student_id: e.target.value}))}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_number})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Fee Type</label>
              <select className="input" value={form.fee_type} onChange={e => setForm(p => ({...p, fee_type: e.target.value}))}>
                {['Tuition', 'Library', 'Lab', 'Sports', 'Exam'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Amount (₹) *</label><input type="number" className="input" value={form.amount} onChange={e => setForm(p => ({...p, amount: e.target.value}))} /></div>
            <div className="col-span-2"><label className="label">Due Date *</label><input type="datetime-local" className="input" value={form.due_date} onChange={e => setForm(p => ({...p, due_date: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
