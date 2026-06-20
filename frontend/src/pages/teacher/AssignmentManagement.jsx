import React, { useEffect, useState } from 'react'
import { assignmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Eye, Trash2 } from 'lucide-react'

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState([])
  const [modal, setModal] = useState(false)
  const [viewSubs, setViewSubs] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState({ title: '', description: '', deadline: '', max_marks: 100 })
  const [loading, setLoading] = useState(false)

  const load = () => assignmentAPI.list().then(r => setAssignments(r.data.assignments || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.title || !form.deadline) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await assignmentAPI.create({ ...form, max_marks: Number(form.max_marks) })
      toast.success('Assignment created!')
      setModal(false)
      setForm({ title: '', description: '', deadline: '', max_marks: 100 })
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Delete this assignment?')) return
    await assignmentAPI.delete(id)
    toast.success('Deleted')
    load()
  }

  const viewSubmissions = async (id) => {
    const r = await assignmentAPI.getSubmissions(id)
    setSubmissions(r.data.submissions || [])
    setViewSubs(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Assignment</button>
      </div>
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                <p className="text-xs text-gray-400 mt-1">Due: {new Date(a.deadline).toLocaleString()} • Max: {a.max_marks} marks</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => viewSubmissions(a.id)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-blue-600"><Eye className="h-4 w-4" /></button>
                <button onClick={() => del(a.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {!assignments.length && <div className="card text-center text-gray-500">No assignments created yet.</div>}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Create Assignment">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Assignment title" /></div>
          <div><label className="label">Description</label><textarea className="input h-24 resize-none" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Deadline *</label><input type="datetime-local" className="input" value={form.deadline} onChange={e => setForm(p => ({...p, deadline: e.target.value}))} /></div>
            <div><label className="label">Max Marks</label><input type="number" className="input" value={form.max_marks} onChange={e => setForm(p => ({...p, max_marks: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
      <Modal open={!!viewSubs} onClose={() => setViewSubs(null)} title="Submissions" size="lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Student ID', 'Submitted At', 'Status', 'Marks', 'Grade'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 pr-4">{s.student_id}</td>
                  <td className="py-2 pr-4">{new Date(s.submitted_at).toLocaleDateString()}</td>
                  <td className="py-2 pr-4"><span className={`badge ${s.status === 'graded' ? 'badge-blue' : s.status === 'late' ? 'badge-red' : 'badge-green'}`}>{s.status}</span></td>
                  <td className="py-2 pr-4">{s.marks_obtained ?? '-'}</td>
                  <td className="py-2">{s.grade ?? '-'}</td>
                </tr>
              ))}
              {!submissions.length && <tr><td colSpan={5} className="py-4 text-center text-gray-500">No submissions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
