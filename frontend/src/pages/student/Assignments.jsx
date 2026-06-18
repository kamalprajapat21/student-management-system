import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { assignmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { PaperClipIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const statusBadge = {
  not_submitted: 'badge-red',
  submitted: 'badge-green',
  late: 'badge-yellow',
  graded: 'badge-blue',
};

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({ content: '', file: null });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await assignmentService.getAll();
      setAssignments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (submitForm.content) formData.append('content', submitForm.content);
      if (submitForm.file) formData.append('file', submitForm.file);
      await assignmentService.submit(selectedAssignment.id, formData);
      toast.success('Assignment submitted!');
      setSelectedAssignment(null);
      setSubmitForm({ content: '', file: null });
      fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const pending = assignments.filter(a => a.submission_status === 'not_submitted');
  const submitted = assignments.filter(a => a.submission_status !== 'not_submitted');

  return (
    <Layout title="Assignments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{assignments.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold text-red-500">{pending.length}</p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-3xl font-bold text-green-500">{submitted.length}</p>
          </div>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <>
            {/* Pending Assignments */}
            {pending.length > 0 && (
              <div>
                <h3 className="section-title">Pending Assignments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pending.map((a) => {
                    const due = new Date(a.due_date);
                    const isOverdue = due < new Date();
                    const daysLeft = Math.ceil((due - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={a.id} className={`card hover:shadow-md transition-shadow border-l-4 ${isOverdue ? 'border-l-red-500' : daysLeft <= 2 ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{a.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{a.subject}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{a.description}</p>
                          </div>
                          <span className={`badge ${isOverdue ? 'badge-red' : 'badge-yellow'} ml-2`}>
                            {isOverdue ? 'Overdue' : `${daysLeft}d left`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            Due: {a.due_date?.slice(0, 10)}
                          </div>
                          <button
                            onClick={() => setSelectedAssignment(a)}
                            className="btn-primary text-sm py-1.5 px-4"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submitted */}
            <div>
              <h3 className="section-title">All Assignments</h3>
              <div className="card overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {['Title', 'Subject', 'Due Date', 'Status', 'Marks'].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{a.title}</td>
                        <td className="py-3 px-4 text-gray-500">{a.subject}</td>
                        <td className="py-3 px-4 text-gray-500">{a.due_date?.slice(0, 10)}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${statusBadge[a.submission_status] || 'badge-blue'}`}>
                            {a.submission_status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {a.submission?.marks_obtained !== null && a.submission?.marks_obtained !== undefined
                            ? `${a.submission.marks_obtained}/${a.total_marks}`
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submit Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => { setSelectedAssignment(null); setSubmitForm({ content: '', file: null }); }}
        title={`Submit: ${selectedAssignment?.title}`}
        footer={
          <>
            <button onClick={() => setSelectedAssignment(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary">
              {submitting ? <LoadingSpinner size="sm" /> : 'Submit Assignment'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Subject: {selectedAssignment?.subject}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Due: {selectedAssignment?.due_date?.slice(0, 16)}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{selectedAssignment?.description}</p>
          </div>
          <div>
            <label className="label">Your Answer / Notes</label>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="Write your answer here..."
              value={submitForm.content}
              onChange={(e) => setSubmitForm(p => ({ ...p, content: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Attach File (Optional)</label>
            <input
              type="file"
              className="input"
              onChange={(e) => setSubmitForm(p => ({ ...p, file: e.target.files[0] }))}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Assignments;
