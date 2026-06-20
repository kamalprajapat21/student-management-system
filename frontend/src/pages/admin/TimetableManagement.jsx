import React, { useEffect, useState } from 'react'
import { timetableAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2 } from 'lucide-react'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function TimetableManagement() {
  const [entries, setEntries] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ class_name: 'CS-3A', section: 'A', day_of_week: 'Monday', start_time: '09:00', end_time: '10:00', room: '', subject_id: '', teacher_id: '' })
  const [loading, setLoading] = useState(false)

  const load = () => timetableAPI.get({ class_name: form.class_name }).then(r => setEntries(r.data.timetable || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    setLoading(true)
    try {
      await timetableAPI.create({ ...form, subject_id: form.subject_id ? Number(form.subject_id) : null, teacher_id: form.teacher_id ? Number(form.teacher_id) : null })
      toast.success('Timetable entry added!')
      setModal(false)
      load()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const del = async (id) => {
    await timetableAPI.delete(id)
    toast.success('Entry deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timetable Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Entry</button>
      </div>
      {DAYS.map(day => {
        const dayEntries = entries.filter(e => e.day_of_week === day)
        if (!dayEntries.length) return null
        return (
          <div key={day} className="card">
            <h3 className="font-semibold text-primary-600 mb-3">{day}</h3>
            <div className="space-y-2">
              {dayEntries.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Subject #{e.subject_id || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{e.start_time} – {e.end_time} {e.room ? `| Room: ${e.room}` : ''}</p>
                  </div>
                  <button onClick={() => del(e.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {!entries.length && <div className="card text-center text-gray-500">No timetable entries.</div>}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Timetable Entry">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Class</label><input className="input" value={form.class_name} onChange={e => setForm(p => ({...p, class_name: e.target.value}))} /></div>
            <div><label className="label">Section</label><input className="input" value={form.section} onChange={e => setForm(p => ({...p, section: e.target.value}))} /></div>
            <div><label className="label">Day</label>
              <select className="input" value={form.day_of_week} onChange={e => setForm(p => ({...p, day_of_week: e.target.value}))}>
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div><label className="label">Room</label><input className="input" value={form.room} onChange={e => setForm(p => ({...p, room: e.target.value}))} /></div>
            <div><label className="label">Start Time</label><input type="time" className="input" value={form.start_time} onChange={e => setForm(p => ({...p, start_time: e.target.value}))} /></div>
            <div><label className="label">End Time</label><input type="time" className="input" value={form.end_time} onChange={e => setForm(p => ({...p, end_time: e.target.value}))} /></div>
            <div><label className="label">Subject ID</label><input type="number" className="input" value={form.subject_id} onChange={e => setForm(p => ({...p, subject_id: e.target.value}))} /></div>
            <div><label className="label">Teacher ID</label><input type="number" className="input" value={form.teacher_id} onChange={e => setForm(p => ({...p, teacher_id: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Entry'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
