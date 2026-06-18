import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { feeService, studentService } from '../../services';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    student_id: '', fee_type: 'tuition', amount: '', due_date: '', description: ''
  });

  useEffect(() => { fetchFees(); }, [statusFilter]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await feeService.getAll(params);
      setFees(data.fees || data || []);
    } finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await feeService.create({ ...form, amount: parseFloat(form.amount) });
      toast.success('Fee created!');
      setShowCreate(false);
      setForm({ student_id: '', fee_type: 'tuition', amount: '', due_date: '', description: '' });
      fetchFees();
    } catch { toast.error('Failed'); } finally { setCreating(false); }
  };

  const markPaid = async (feeId) => {
    try {
      await feeService.pay({ fee_id: feeId, payment_method: 'cash', payment_reference: `PAY-${Date.now()}` });
      toast.success('Marked as paid');
      fetchFees();
    } catch { toast.error('Failed'); }
  };

  const statusBadge = (status) => ({
    paid: 'badge-green', pending: 'badge-yellow', overdue: 'badge-red'
  })[status] || 'badge-blue';

  return (
    <Layout title="Fee Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="page-title">Fee Management</h2>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Add Fee
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'paid', 'overdue'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="card overflow-x-auto">
          {loading ? <LoadingSpinner className="py-8" /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Student', 'Type', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{f.student_name || f.student_id}</td>
                    <td className="py-3 px-4 text-gray-500 capitalize">{f.fee_type}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">₹{f.amount?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-500">{f.due_date?.slice(0, 10)}</td>
                    <td className="py-3 px-4"><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      {f.status !== 'paid' && (
                        <button onClick={() => markPaid(f.id)} className="text-green-600 text-sm font-medium">Mark Paid</button>
                      )}
                      <button
                        onClick={() => window.open(`/api/fees/${f.id}/receipt`, '_blank')}
                        className="text-primary-600 text-sm font-medium flex items-center gap-1"
                      >
                        <ArrowDownTrayIcon className="w-3.5 h-3.5" />Receipt
                      </button>
                    </td>
                  </tr>
                ))}
                {fees.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-400">No fees found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add Fee" size="md"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <LoadingSpinner size="sm" /> : 'Add Fee'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div><label className="label">Student ID</label><input className="input" value={form.student_id} onChange={(e) => setForm(p => ({ ...p, student_id: e.target.value }))} required /></div>
          <div><label className="label">Fee Type</label>
            <select className="input" value={form.fee_type} onChange={(e) => setForm(p => ({ ...p, fee_type: e.target.value }))}>
              {['tuition', 'lab', 'library', 'hostel', 'transport', 'exam', 'other'].map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
          <div><label className="label">Amount (₹)</label><input type="number" className="input" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
          <div><label className="label">Due Date</label><input type="date" className="input" value={form.due_date} onChange={(e) => setForm(p => ({ ...p, due_date: e.target.value }))} required /></div>
          <div><label className="label">Description</label><input className="input" value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} /></div>
        </form>
      </Modal>
    </Layout>
  );
};

export default FeeManagement;
