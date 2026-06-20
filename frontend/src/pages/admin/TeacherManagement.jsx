import React, { useEffect, useState } from 'react'
import { teacherAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2, Search } from 'lucide-react'

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', password: 'Teacher@123', phone: '', employee_id: '', department: '', qualification: '', experience_years: '' })
  const [loading, setLoading] = useState(false)

  const load = () => teacherAPI.list({ search }).then(r => setTeachers(r.data.teachers || [])).catch(() => {})
  useEffect(load, [])

  const create = async () => {
    if (!form.email || !form.employee_id || !form.full_name) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await authAPI.registerTeacher({ ...form, experience_years: Number(form.experience_years) || 0 })
      toast.success('Teacher added!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Deactivate this teacher?')) return
    await teacherAPI.delete(id)
    toast.success('Teacher deactivated')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Teacher</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search teachers..." value={search}
              onChange={e => { setSearch(e.target.value); load() }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Email', 'Employee ID', 'Department', 'Experience', 'Actions'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 pr-4 font-medium">{t.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{t.email}</td>
                  <td className="py-3 pr-4">{t.employee_id}</td>
                  <td className="py-3 pr-4">{t.department}</td>
                  <td className="py-3 pr-4">{t.experience_years ? `${t.experience_years} yrs` : '-'}</td>
                  <td className="py-3">
                    <button onClick={() => del(t.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!teachers.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No teachers found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Teacher">
        <div className="space-y-3">
          {[
            ['full_name', 'Full Name *', 'text'],
            ['email', 'Email *', 'email'],
            ['password', 'Password', 'password'],
            ['phone', 'Phone', 'tel'],
            ['employee_id', 'Employee ID *', 'text'],
            ['department', 'Department', 'text'],
            ['qualification', 'Qualification', 'text'],
            ['experience_years', 'Experience (years)', 'number'],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input type={type} className="input" value={form[name]}
                onChange={e => setForm(p => ({...p, [name]: e.target.value}))} />
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Teacher'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
