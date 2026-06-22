import React, { useEffect, useState } from 'react'
import { examAPI, studentAPI } from '../../services/api'
import Modal from '../../components/common/Modal'
import { FullPageLoader } from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { Plus, BookOpen, ClipboardList, Search } from 'lucide-react'

export default function PracticalManagement() {
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMarksModal, setShowMarksModal] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)
  const [examMarks, setExamMarks] = useState([])
  const [marksInput, setMarksInput] = useState({})
  const [creating, setCreating] = useState(false)
  const [savingMarks, setSavingMarks] = useState(false)

  const [form, setForm] = useState({
    title: '',
    class_name: '',
    section: '',
    exam_date: '',
    total_marks: 50,
    passing_marks: 20,
    duration_minutes: 120,
  })

  useEffect(() => {
    Promise.all([
      examAPI.list({ exam_type: 'practical' }),
      studentAPI.list({ limit: 200 }),
    ])
      .then(([eRes, sRes]) => {
        const practicals = (eRes.data?.exams || eRes.data || []).filter(
          e => e.exam_type === 'practical'
        )
        setExams(practicals)
        setStudents(sRes.data?.students || [])
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.exam_date) return toast.error('Title and date required')
    setCreating(true)
    try {
      const payload = {
        ...form,
        exam_type: 'practical',
        total_marks: Number(form.total_marks),
        passing_marks: Number(form.passing_marks),
        duration_minutes: Number(form.duration_minutes),
      }
      const res = await examAPI.create(payload)
      setExams(prev => [res.data, ...prev])
      setShowCreateModal(false)
      setForm({ title: '', class_name: '', section: '', exam_date: '', total_marks: 50, passing_marks: 20, duration_minutes: 120 })
      toast.success('Practical exam created')
    } catch {
      toast.error('Failed to create exam')
    } finally {
      setCreating(false)
    }
  }

  const openMarksModal = async (exam) => {
    setSelectedExam(exam)
    setShowMarksModal(true)
    try {
      const res = await examAPI.getMarks(exam.id)
      const existing = {}
      ;(res.data?.marks || []).forEach(m => { existing[m.student_id] = m.marks_obtained })
      setExamMarks(res.data?.marks || [])
      setMarksInput(existing)
    } catch {
      toast.error('Failed to load marks')
    }
  }

  const handleSaveMarks = async () => {
    setSavingMarks(true)
    let successCount = 0
    for (const [studentId, marks] of Object.entries(marksInput)) {
      if (marks === '' || marks === undefined) continue
      try {
        await examAPI.addMarks({
          student_id: Number(studentId),
          exam_id: selectedExam.id,
          marks_obtained: Number(marks),
        })
        successCount++
      } catch { /* skip individual errors */ }
    }
    toast.success(`Saved marks for ${successCount} student(s)`)
    setSavingMarks(false)
    setShowMarksModal(false)
  }

  const filteredExams = exams.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.class_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <FullPageLoader />

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Practical Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and grade practical examinations</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" /> New Practical Exam
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary-600">{exams.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Practicals</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-green-600">
            {exams.filter(e => new Date(e.exam_date) < new Date()).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-amber-600">
            {exams.filter(e => new Date(e.exam_date) >= new Date()).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Upcoming</p>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by title or class..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No practical exams yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Class</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Total Marks</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.map(exam => {
                  const isPast = new Date(exam.exam_date) < new Date()
                  return (
                    <tr key={exam.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{exam.title}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {exam.class_name || '—'} {exam.section ? `(${exam.section})` : ''}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{exam.total_marks}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${isPast ? 'badge-green' : 'badge-yellow'}`}>
                          {isPast ? 'Completed' : 'Upcoming'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          className="btn-secondary text-xs py-1 px-3 flex items-center gap-1"
                          onClick={() => openMarksModal(exam)}
                        >
                          <BookOpen className="h-3 w-3" /> Enter Marks
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Practical Exam" size="md">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input className="input" required value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Chemistry Lab – Unit 3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Class</label>
              <input className="input" value={form.class_name}
                onChange={e => setForm(p => ({ ...p, class_name: e.target.value }))}
                placeholder="e.g. 10th" />
            </div>
            <div>
              <label className="label">Section</label>
              <input className="input" value={form.section}
                onChange={e => setForm(p => ({ ...p, section: e.target.value }))}
                placeholder="e.g. A" />
            </div>
          </div>
          <div>
            <label className="label">Exam Date *</label>
            <input type="datetime-local" className="input" required value={form.exam_date}
              onChange={e => setForm(p => ({ ...p, exam_date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Total Marks</label>
              <input type="number" className="input" min={1} value={form.total_marks}
                onChange={e => setForm(p => ({ ...p, total_marks: e.target.value }))} />
            </div>
            <div>
              <label className="label">Passing Marks</label>
              <input type="number" className="input" min={1} value={form.passing_marks}
                onChange={e => setForm(p => ({ ...p, passing_marks: e.target.value }))} />
            </div>
            <div>
              <label className="label">Duration (min)</label>
              <input type="number" className="input" min={1} value={form.duration_minutes}
                onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creating…' : 'Create Exam'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Marks Entry Modal */}
      <Modal open={showMarksModal} onClose={() => setShowMarksModal(false)} title={`Enter Marks – ${selectedExam?.title}`} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Total Marks: <strong>{selectedExam?.total_marks}</strong> | Passing: <strong>{selectedExam?.passing_marks}</strong>
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {students.map(s => (
              <div key={s.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{s.full_name}</p>
                  <p className="text-xs text-gray-400">{s.roll_number} · {s.class_name}</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={selectedExam?.total_marks}
                  className="input w-24 text-center"
                  placeholder="—"
                  value={marksInput[s.id] ?? ''}
                  onChange={e => setMarksInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                />
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-gray-400 text-center py-6">No students found</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-secondary" onClick={() => setShowMarksModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSaveMarks} disabled={savingMarks}>
              {savingMarks ? 'Saving…' : 'Save Marks'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
