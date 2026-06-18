import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { examService } from '../../services';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MarksManagement = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [bulkMarks, setBulkMarks] = useState([]);
  const [form, setForm] = useState({
    title: '', exam_type: 'internal', subject: '', class_id: '', department: '',
    exam_date: '', start_time: '', end_time: '', total_marks: 100, venue: ''
  });

  useEffect(() => { fetchExams(); }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data } = await examService.getAll();
      setExams(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await examService.create({ ...form, total_marks: parseFloat(form.total_marks) });
      toast.success('Exam scheduled!');
      setShowCreate(false);
      fetchExams();
    } catch { toast.error('Failed to create exam'); } finally { setCreating(false); }
  };

  const handleBulkUpload = async () => {
    if (!selectedExam || !bulkMarks.length) return;
    try {
      await examService.bulkUploadMarks({ exam_id: selectedExam.id, marks: bulkMarks });
      toast.success('Marks uploaded!');
      setSelectedExam(null);
      setBulkMarks([]);
    } catch { toast.error('Failed to upload marks'); }
  };

  return (
    <Layout title="Marks Management">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="page-title">Exams & Marks</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Schedule Exam
          </button>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Title', 'Subject', 'Type', 'Class', 'Date', 'Total Marks', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{exam.title}</td>
                    <td className="py-3 px-4 text-gray-500">{exam.subject}</td>
                    <td className="py-3 px-4"><span className="badge badge-blue capitalize">{exam.exam_type}</span></td>
                    <td className="py-3 px-4 text-gray-500">{exam.class_id}</td>
                    <td className="py-3 px-4 text-gray-500">{exam.exam_date}</td>
                    <td className="py-3 px-4 text-gray-500">{exam.total_marks}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setSelectedExam(exam)} className="text-primary-600 text-sm font-medium">
                        Upload Marks
                      </button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No exams scheduled</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Exam Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Exam" size="lg"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <LoadingSpinner size="sm" /> : 'Schedule'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Title</label><input className="input" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
            <div><label className="label">Type</label>
              <select className="input" value={form.exam_type} onChange={(e) => setForm(p => ({ ...p, exam_type: e.target.value }))}>
                {['midterm', 'final', 'quiz', 'internal'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
            <div><label className="label">Class</label><input className="input" value={form.class_id} onChange={(e) => setForm(p => ({ ...p, class_id: e.target.value }))} required /></div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))} required /></div>
            <div><label className="label">Exam Date</label><input type="date" className="input" value={form.exam_date} onChange={(e) => setForm(p => ({ ...p, exam_date: e.target.value }))} required /></div>
            <div><label className="label">Start Time</label><input type="time" className="input" value={form.start_time} onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))} required /></div>
            <div><label className="label">End Time</label><input type="time" className="input" value={form.end_time} onChange={(e) => setForm(p => ({ ...p, end_time: e.target.value }))} required /></div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={form.total_marks} onChange={(e) => setForm(p => ({ ...p, total_marks: e.target.value }))} /></div>
            <div><label className="label">Venue</label><input className="input" value={form.venue} onChange={(e) => setForm(p => ({ ...p, venue: e.target.value }))} /></div>
          </div>
        </form>
      </Modal>

      {/* Upload Marks Modal */}
      <Modal isOpen={!!selectedExam} onClose={() => { setSelectedExam(null); setBulkMarks([]); }}
        title={`Upload Marks: ${selectedExam?.title}`} size="lg"
        footer={
          <>
            <button onClick={() => setSelectedExam(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleBulkUpload} className="btn-primary">Upload All Marks</button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Enter student ID and marks (out of {selectedExam?.total_marks})</p>
          {bulkMarks.map((row, i) => (
            <div key={i} className="flex gap-3">
              <input className="input flex-1" placeholder="Student ID" value={row.student_id}
                onChange={(e) => setBulkMarks(prev => { const n = [...prev]; n[i] = { ...n[i], student_id: e.target.value }; return n; })} />
              <input type="number" className="input w-28" placeholder="Marks" value={row.marks_obtained}
                onChange={(e) => setBulkMarks(prev => { const n = [...prev]; n[i] = { ...n[i], marks_obtained: e.target.value }; return n; })} />
              <button onClick={() => setBulkMarks(prev => prev.filter((_, j) => j !== i))} className="text-red-500 text-sm px-2">✕</button>
            </div>
          ))}
          <button onClick={() => setBulkMarks(prev => [...prev, { student_id: '', marks_obtained: '' }])} className="btn-secondary text-sm w-full">
            + Add Row
          </button>
        </div>
      </Modal>
    </Layout>
  );
};

export default MarksManagement;
