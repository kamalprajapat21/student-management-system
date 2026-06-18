import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { leaveService } from '../../services';
import toast from 'react-hot-toast';

const statusColors = { pending: 'badge-yellow', approved: 'badge-green', rejected: 'badge-red' };

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });

  useEffect(() => { fetchLeaves(); }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await leaveService.getMyLeaves();
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await leaveService.apply(form);
      toast.success('Leave application submitted!');
      setShowModal(false);
      setForm({ leave_type: 'sick', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Layout title="Leave Application">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="page-title">My Leaves</h2>
          <button onClick={() => setShowModal(true)} className="btn-primary">Apply for Leave</button>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Type', 'From', 'To', 'Days', 'Reason', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {leaves.map((leave) => {
                    const days = Math.ceil((new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <tr key={leave.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 capitalize font-medium text-gray-900 dark:text-white">{leave.leave_type}</td>
                        <td className="py-3 px-4 text-gray-600">{leave.start_date}</td>
                        <td className="py-3 px-4 text-gray-600">{leave.end_date}</td>
                        <td className="py-3 px-4 text-gray-600">{days}</td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{leave.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`badge ${statusColors[leave.status]}`}>{leave.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{leave.remarks || '-'}</td>
                      </tr>
                    );
                  })}
                  {leaves.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400">No leave applications</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Apply for Leave"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleApply} disabled={applying} className="btn-primary">
              {applying ? <LoadingSpinner size="sm" /> : 'Submit Application'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="label">Leave Type</label>
            <select className="input" value={form.leave_type} onChange={(e) => setForm(p => ({ ...p, leave_type: e.target.value }))}>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="family">Family Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input" value={form.start_date} onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))} required />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input" value={form.end_date} onChange={(e) => setForm(p => ({ ...p, end_date: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="label">Reason</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Explain your reason..." value={form.reason} onChange={(e) => setForm(p => ({ ...p, reason: e.target.value }))} required />
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default Leaves;
