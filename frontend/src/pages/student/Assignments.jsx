import React, { useEffect, useState } from 'react'
import { studentAPI, assignmentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import Modal from '../../components/common/Modal'
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Assignments() {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(null)
  const [textContent, setTextContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    studentAPI.assignments().then(r => { setAssignments(r.data.assignments || []); setLoading(false) }).catch(() => setLoading(false))
  }
  useEffect(load, [])

  const submit = async () => {
    if (!textContent.trim()) return toast.error('Please enter your answer')
    setSubmitting(true)
    try {
      await assignmentAPI.submit(submitModal.id, textContent)
      toast.success('Assignment submitted!')
      setSubmitModal(null)
      setTextContent('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" /></div>

  const pending = assignments.filter(a => !a.submitted)
  const submitted = assignments.filter(a => a.submitted)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assignments</h1>
        <div className="flex gap-2">
          <span className="badge badge-yellow">{pending.length} Pending</span>
          <span className="badge badge-green">{submitted.length} Submitted</span>
        </div>
      </div>
      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Pending</h2>
          <div className="space-y-3">
            {pending.map(a => {
              const isOverdue = new Date(a.deadline) < new Date()
              return (
                <div key={a.id} className="card border-l-4 border-l-yellow-400">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {isOverdue ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                        <span className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          Due: {new Date(a.deadline).toLocaleString()}
                          {isOverdue ? ' (Overdue)' : ''}
                        </span>
                        <span className="text-xs text-gray-500">• Max: {a.max_marks} marks</span>
                      </div>
                    </div>
                    <button onClick={() => setSubmitModal(a)} className="btn-primary text-sm flex items-center gap-1 whitespace-nowrap">
                      <Upload className="h-4 w-4" /> Submit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {submitted.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Submitted</h2>
          <div className="space-y-3">
            {submitted.map(a => (
              <div key={a.id} className="card border-l-4 border-l-green-400">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{a.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Submitted {new Date(a.submission?.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {a.submission?.marks_obtained != null && (
                      <p className="font-bold text-primary-600">{a.submission.marks_obtained}/{a.max_marks}</p>
                    )}
                    <span className={`badge ${a.submission?.status === 'graded' ? 'badge-blue' : 'badge-green'}`}>
                      {a.submission?.status}
                    </span>
                  </div>
                </div>
                {a.submission?.feedback && (
                  <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
                    Feedback: {a.submission.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <Modal open={!!submitModal} onClose={() => setSubmitModal(null)} title={`Submit: ${submitModal?.title}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Due: {submitModal && new Date(submitModal.deadline).toLocaleString()}</p>
          <div>
            <label className="label">Your Answer</label>
            <textarea className="input h-40 resize-none" value={textContent}
              onChange={e => setTextContent(e.target.value)} placeholder="Type your answer here..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setSubmitModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
