import React, { useEffect, useState } from 'react'
import { examAPI, studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Plus } from 'lucide-react'

export default function MarksManagement() {
  const [exams, setExams] = useState([])
  const [students, setStudents] = useState([])
  const [examModal, setExamModal] = useState(false)
  const [marksModal, setMarksModal] = useState(null)
  const [examForm, setExamForm] = useState({ title: '', exam_date: '', exam_type: 'midterm', total_marks: 100, class_name: '' })
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)

  const loadExams = () => examAPI.list().then(r => setExams(r.data.exams || [])).catch(() => {})
  const loadStudents = () => studentAPI.list({ limit: 100 }).then(r => setStudents(r.data.students || [])).catch(() => {})
  useEffect(() => { loadExams(); loadStudents() }, [])

  const createExam = async () => {
    if (!examForm.title || !examForm.exam_date) return toast.error('Fill required fields')
    setLoading(true)
    try {
      await examAPI.create({ ...examForm, total_marks: Number(examForm.total_marks) })
      toast.success('Exam created!')
      setExamModal(false)
      loadExams()
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  const openMarksModal = (exam) => {
    setMarksModal(exam)
    const m = {}
    students.forEach(s => { m[s.id] = '' })
    setMarks(m)
  }

  const saveMarks = async () => {
    setLoading(true)
    try {
      for (const [student_id, val] of Object.entries(marks)) {
        if (val !== '') {
          await examAPI.addMarks({ student_id: Number(student_id), exam_id: marksModal.id, marks_obtained: Number(val) })
        }
      }
      toast.success('Marks saved!')
      setMarksModal(null)
    } catch { toast.error('Failed') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks Management</h1>
        <button onClick={() => setExamModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Create Exam</button>
      </div>
      <div className="space-y-3">
        {exams.map(e => (
          <div key={e.id} className="card flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{e.title}</h3>
              <p className="text-sm text-gray-500">{new Date(e.exam_date).toLocaleDateString()} • {e.exam_type} • {e.total_marks} marks</p>
            </div>
            <button onClick={() => openMarksModal(e)} className="btn-primary text-sm">Enter Marks</button>
          </div>
        ))}
        {!exams.length && <div className="card text-center text-gray-500">No exams created yet.</div>}
      </div>
      <Modal open={examModal} onClose={() => setExamModal(false)} title="Create Exam">
        <div className="space-y-4">
          <div><label className="label">Title *</label><input className="input" value={examForm.title} onChange={e => setExamForm(p => ({...p, title: e.target.value}))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date *</label><input type="datetime-local" className="input" value={examForm.exam_date} onChange={e => setExamForm(p => ({...p, exam_date: e.target.value}))} /></div>
            <div><label className="label">Type</label>
              <select className="input" value={examForm.exam_type} onChange={e => setExamForm(p => ({...p, exam_type: e.target.value}))}>
                {['midterm', 'final', 'quiz', 'practical'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={examForm.total_marks} onChange={e => setExamForm(p => ({...p, total_marks: e.target.value}))} /></div>
            <div><label className="label">Class</label><input className="input" value={examForm.class_name} placeholder="CS-3A" onChange={e => setExamForm(p => ({...p, class_name: e.target.value}))} /></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setExamModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={createExam} disabled={loading} className="btn-primary flex-1">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </div>
      </Modal>
      <Modal open={!!marksModal} onClose={() => setMarksModal(null)} title={`Enter Marks: ${marksModal?.title}`} size="lg">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {students.map(s => (
            <div key={s.id} className="flex items-center gap-4">
              <div className="flex-1"><p className="font-medium text-sm">{s.full_name}</p><p className="text-xs text-gray-500">{s.roll_number}</p></div>
              <input type="number" className="input w-24 text-center" placeholder="0" min="0" max={marksModal?.total_marks}
                value={marks[s.id] || ''} onChange={e => setMarks(p => ({...p, [s.id]: e.target.value}))} />
              <span className="text-sm text-gray-400">/{marksModal?.total_marks}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => setMarksModal(null)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={saveMarks} disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Marks'}</button>
        </div>
      </Modal>
    </div>
  )
}
