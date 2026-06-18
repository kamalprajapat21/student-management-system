import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { examService } from '../../services';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PracticalManagement = () => {
  const [practicals, setPracticals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', subject: '', class_id: '', department: '',
    practical_date: '', start_time: '', end_time: '', total_marks: 50, venue: '', batch: ''
  });

  useEffect(() => {
    examService.getAll({ exam_type: 'practical' })
      .then(({ data }) => setPracticals(data.filter(e => e.exam_type === 'practical')))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await examService.createPractical({ ...form, total_marks: parseFloat(form.total_marks) });
      toast.success('Practical scheduled!');
      setShowCreate(false);
      const { data } = await examService.getAll({ exam_type: 'practical' });
      setPracticals(data.filter(e => e.exam_type === 'practical'));
    } catch { toast.error('Failed'); } finally { setCreating(false); }
  };

  return (
    <Layout title="Practical Management">
      <div className="space-y-6">
        <div className="flex justify-between">
          <h2 className="page-title">Practicals</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Schedule Practical
          </button>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {practicals.map((p) => {
              const daysLeft = Math.ceil((new Date(p.exam_date || p.practical_date) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={p.id} className="card border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="badge badge-yellow mb-2">Practical</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{p.title}</h4>
                      <p className="text-sm text-gray-500">{p.subject}</p>
                    </div>
                    {daysLeft >= 0 && (
                      <div className={`text-right ${daysLeft <= 3 ? 'text-red-600' : 'text-green-600'}`}>
                        <p className="text-xl font-bold">{daysLeft}d</p>
                        <p className="text-xs">left</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <span>📅 {p.exam_date || p.practical_date}</span>
                    <span>🕐 {p.start_time}</span>
                    <span>🏫 {p.class_id}</span>
                    {p.venue && <span>📍 {p.venue}</span>}
                  </div>
                </div>
              );
            })}
            {practicals.length === 0 && (
              <div className="col-span-2 card text-center py-12 text-gray-400">No practicals scheduled</div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Schedule Practical" size="lg"
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
            <div><label className="label">Subject</label><input className="input" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
            <div><label className="label">Class</label><input className="input" value={form.class_id} onChange={(e) => setForm(p => ({ ...p, class_id: e.target.value }))} required /></div>
            <div><label className="label">Department</label><input className="input" value={form.department} onChange={(e) => setForm(p => ({ ...p, department: e.target.value }))} required /></div>
            <div><label className="label">Date</label><input type="date" className="input" value={form.practical_date} onChange={(e) => setForm(p => ({ ...p, practical_date: e.target.value }))} required /></div>
            <div><label className="label">Start Time</label><input type="time" className="input" value={form.start_time} onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))} required /></div>
            <div><label className="label">End Time</label><input type="time" className="input" value={form.end_time} onChange={(e) => setForm(p => ({ ...p, end_time: e.target.value }))} required /></div>
            <div><label className="label">Total Marks</label><input type="number" className="input" value={form.total_marks} onChange={(e) => setForm(p => ({ ...p, total_marks: e.target.value }))} /></div>
            <div><label className="label">Venue/Lab</label><input className="input" value={form.venue} onChange={(e) => setForm(p => ({ ...p, venue: e.target.value }))} /></div>
            <div><label className="label">Batch (optional)</label><input className="input" value={form.batch} placeholder="e.g. Batch A" onChange={(e) => setForm(p => ({ ...p, batch: e.target.value }))} /></div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default PracticalManagement;
