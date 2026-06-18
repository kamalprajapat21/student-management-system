import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { assignmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AssignmentManagement = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedForGrade, setSelectedForGrade] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', subject: '', class_id: '',
    due_date: '', total_marks: 100
  });

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await assignmentService.getAll();
      setAssignments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await assignmentService.create({ ...form, total_marks: parseFloat(form.total_marks) });
      toast.success('Assignment created!');
      setShowCreate(false);
      setForm({ title: '', description: '', subject: '', class_id: '', due_date: '', total_marks: 100 });
      fetchAssignments();
    } catch (err) {
      toast.error('Failed to create assignment');
    } finally {
      setCreating(false);
    }
  };

  const viewSubmissions = async (assignment) => {
    setSelectedForGrade(assignment);
    try {
      const { data } = await assignmentService.getSubmissions(assignment.id);
      setSubmissions(data);
    } catch { setSubmissions([]); }
  };

  const gradeSubmission = async (submissionId, marks, feedback) => {
    try {
      await assignmentService.grade({ submission_id: submissionId, marks_obtained: parseFloat(marks), feedback });
      toast.success('Graded!');
      viewSubmissions(selectedForGrade);
    } catch { toast.error('Failed to grade'); }
  };

  return (
    <Layout title="Assignment Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="page-title">Assignments</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Assignment
          </button>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Title', 'Subject', 'Class', 'Due Date', 'Total Marks', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{a.title}</td>
                    <td className="py-3 px-4 text-gray-500">{a.subject}</td>
                    <td className="py-3 px-4 text-gray-500">{a.class_id}</td>
                    <td className="py-3 px-4 text-gray-500">{a.due_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-gray-500">{a.total_marks}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => viewSubmissions(a)} className="text-primary-600 text-sm font-medium hover:text-primary-700">
                        View Submissions
                      </button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No assignments created</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Assignment" size="lg"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <LoadingSpinner size="sm" /> : 'Create'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
          <div><label className="label">Description</label><textarea className="input min-h-[80px]" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
            <div><label className="label">Class</label><input className="input" placeholder="e.g. CSE-A" value={form.class_id} onChange={(e) => setForm(p => ({ ...p, class_id: e.target.value }))} required /></div>
            <div><label className="label">Due Date & Time</label><input type="datetime-local" className="input" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} required /></div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={form.total_marks} onChange={(e) => setForm(p => ({ ...p, total_marks: e.target.value }))} /></div>
          </div>
        </form>
      </Modal>

      {/* Submissions Modal */}
      <Modal isOpen={!!selectedForGrade} onClose={() => setSelectedForGrade(null)} title={`Submissions: ${selectedForGrade?.title}`} size="xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Student', 'Submitted At', 'Status', 'Marks', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 px-4 font-medium">{s.student_name}</td>
                  <td className="py-3 px-4 text-gray-500">{s.submitted_at?.slice(0, 16)}</td>
                  <td className="py-3 px-4"><span className={`badge ${s.status === 'graded' ? 'badge-green' : s.status === 'late' ? 'badge-yellow' : 'badge-blue'}`}>{s.status}</span></td>
                  <td className="py-3 px-4">{s.marks_obtained !== null ? `${s.marks_obtained}/${selectedForGrade?.total_marks}` : '-'}</td>
                  <td className="py-3 px-4">
                    {s.status !== 'graded' && (
                      <button
                        onClick={() => {
                          const marks = prompt(`Enter marks (out of ${selectedForGrade?.total_marks}):`);
                          if (marks) gradeSubmission(s.id, marks, '');
                        }}
                        className="text-primary-600 text-sm font-medium"
                      >
                        Grade
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-gray-400">No submissions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </Layout>
  );
};

export default AssignmentManagement;
