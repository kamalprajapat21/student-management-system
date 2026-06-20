import React, { useEffect, useState } from 'react'
import { studentAPI, authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus, Trash2, Search } from 'lucide-react'

export default function StudentManagement() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', password: 'Student@123', phone: '', roll_number: '', department: 'Computer Science', class_name: 'CS-3A', section: 'A', semester: '3', year: '2' })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState({ total: 0, skip: 0 })

  const load = (search = '', skip = 0) => {
    studentAPI.list({ search, skip, limit: 20 }).then(r => {
      setStudents(r.data.students || [])
      setPage({ total: r.data.total || 0, skip })
    }).catch(() => {})
  }
  useEffect(() => load(), [])

  const create = async () => {
    if (!form.email || !form.roll_number || !form.full_name) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await authAPI.registerStudent({ ...form, semester: Number(form.semester), year: Number(form.year) })
      toast.success('Student added!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.detail || 'Failed') }
    finally { setLoading(false) }
  }

  const del = async (id) => {
    if (!confirm('Deactivate this student?')) return
    await studentAPI.delete(id)
    toast.success('Student deactivated')
    load(search)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Student</button>
      </div>
      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input className="input pl-9" placeholder="Search students..." value={search}
              onChange={e => { setSearch(e.target.value); load(e.target.value) }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-gray-700">
              {['Name', 'Email', 'Roll No', 'Class', 'Department', 'Actions'].map(h => <th key={h} className="text-left py-2 pr-4 text-gray-500">{h}</th>)}
            </tr></thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 pr-4 font-medium">{s.full_name}</td>
                  <td className="py-3 pr-4 text-gray-500">{s.email}</td>
                  <td className="py-3 pr-4">{s.roll_number}</td>
                  <td className="py-3 pr-4">{s.class_name}</td>
                  <td className="py-3 pr-4">{s.department}</td>
                  <td className="py-3">
                    <button onClick={() => del(s.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {!students.length && <tr><td colSpan={6} className="py-8 text-center text-gray-500">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 mt-2">Total: {page.total} students</p>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add New Student" size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['full_name', 'Full Name *', 'text'],
            ['email', 'Email *', 'email'],
            ['password', 'Password', 'password'],
            ['phone', 'Phone', 'tel'],
            ['roll_number', 'Roll Number *', 'text'],
            ['department', 'Department', 'text'],
            ['class_name', 'Class', 'text'],
            ['section', 'Section', 'text'],
            ['semester', 'Semester', 'number'],
            ['year', 'Year', 'number'],
          ].map(([name, label, type]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input type={type} className="input" value={form[name]}
                onChange={e => setForm(p => ({...p, [name]: e.target.value}))} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={create} disabled={loading} className="btn-primary flex-1">{loading ? 'Adding...' : 'Add Student'}</button>
        </div>
      </Modal>
    </div>
  )
}
