import React, { useEffect, useState } from 'react'
import { leaveAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'

export default function Leaves() {
  const [leaves, setLeaves] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ reason: '', from_date: '', to_date: '' })
  const [loading, setLoading] = useState(false)

  const load = () => leaveAPI.myLeaves().then(r => setLeaves(r.data.leaves || [])).catch(() => {})
  useEffect(load, [])

  const submit = async () => {
    if (!form.reason || !form.from_date || !form.to_date) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await leaveAPI.apply(form)
      toast.success('Leave application submitted')
      setModal(false)
      setForm({ reason: '', from_date: '', to_date: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    } finally {
      setLoading(false)
    }
  }

  const statusColor = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Applications</h1>
        <button onClick={() => setModal(true)} className="btn-primary">Apply for Leave</button>
      </div>
      <div className="space-y-3">
        {leaves.map(l => (
          <div key={l.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{l.reason}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(l.from_date).toLocaleDateString()} – {new Date(l.to_date).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">Applied: {new Date(l.applied_at).toLocaleDateString()}</p>
              </div>
              <span className={`badge ${statusColor[l.status]}`}>{l.status}</span>
            </div>
          </div>
        ))}
        {!leaves.length && <div className="card text-center text-gray-500">No leave applications found.</div>}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave">
        <div className="space-y-4">
          <div><label className="label">Reason</label>
            <textarea className="input h-24 resize-none" value={form.reason}
              onChange={e => setForm(p => ({...p, reason: e.target.value}))} placeholder="Reason for leave..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">From Date</label>
              <input type="date" className="input" value={form.from_date} onChange={e => setForm(p => ({...p, from_date: e.target.value}))} /></div>
            <div><label className="label">To Date</label>
              <input type="date" className="input" value={form.to_date} onChange={e => setForm(p => ({...p, to_date: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1">{loading ? 'Submitting...' : 'Submit'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
