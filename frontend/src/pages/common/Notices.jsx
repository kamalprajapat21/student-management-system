import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { noticeAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Bell } from 'lucide-react'

export default function Notices() {
  const { user } = useAuth()
  const [notices, setNotices] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', target_role: 'all' })
  const [loading, setLoading] = useState(false)

  const load = () => noticeAPI.list().then(r => setNotices(r.data.notices || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.title || !form.description) return toast.error('Fill all fields')
    setLoading(true)
    try {
      await noticeAPI.create(form)
      toast.success('Notice published!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    await noticeAPI.delete(id)
    toast.success('Notice deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices & Announcements</h1>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Post Notice</button>
        )}
      </div>
      <div className="space-y-4">
        {notices.map(n => (
          <div key={n.id} className="card border-l-4 border-l-primary-400">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bell className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{n.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{n.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                    <span className="badge badge-blue">{n.target_role}</span>
                  </div>
                </div>
              </div>
              {(user?.role === 'teacher' || user?.role === 'admin') && (
                <button onClick={() => del(n.id)} className="text-xs text-red-500 hover:text-red-700 ml-4">Delete</button>
              )}
            </div>
          </div>
        ))}
        {!notices.length && (
          <div className="card text-center text-gray-500 py-12">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No notices posted yet.</p>
          </div>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Post a Notice">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="Notice title" /></div>
          <div><label className="label">Description *</label><textarea className="input h-32 resize-none" value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} placeholder="Notice content..." /></div>
          <div><label className="label">Target Audience</label>
            <select className="input" value={form.target_role} onChange={e => setForm(p => ({...p, target_role: e.target.value}))}>
              {['all', 'student', 'teacher', 'parent'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Posting...' : 'Post Notice'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
