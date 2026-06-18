import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { noticeService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { ExclamationTriangleIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const priorityConfig = {
  urgent: { label: 'Urgent', class: 'badge-red', border: 'border-l-red-500' },
  high: { label: 'High', class: 'badge-yellow', border: 'border-l-yellow-500' },
  normal: { label: 'Normal', class: 'badge-blue', border: 'border-l-blue-400' },
  low: { label: 'Low', class: 'bg-gray-100 text-gray-600', border: 'border-l-gray-300' },
};

const Notices = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', priority: 'normal', target: 'all', target_class: ''
  });

  useEffect(() => { fetchNotices(); }, []);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const { data } = await noticeService.getAll({ limit: 30 });
      setNotices(data.notices || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await noticeService.create(form);
      toast.success('Notice published!');
      setShowCreate(false);
      setForm({ title: '', content: '', priority: 'normal', target: 'all', target_class: '' });
      fetchNotices();
    } catch (err) {
      toast.error('Failed to publish notice');
    } finally {
      setCreating(false);
    }
  };

  const canCreate = ['teacher', 'admin'].includes(user?.role);

  return (
    <Layout title="Notices">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Notice Board</h2>
            <p className="text-gray-500 text-sm">{total} notices</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Post Notice
            </button>
          )}
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="space-y-4">
            {notices.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">No notices posted yet</div>
            ) : (
              notices.map((notice) => {
                const config = priorityConfig[notice.priority] || priorityConfig.normal;
                return (
                  <div key={notice.id} className={`card border-l-4 ${config.border} hover:shadow-md transition-shadow`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {notice.priority === 'urgent' && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`badge ${config.class}`}>{config.label}</span>
                          <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                            For: {notice.target?.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">{notice.content}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
                      <span>By: {notice.created_by_name}</span>
                      <span>•</span>
                      <span>{notice.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Create Notice Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Post a Notice"
        size="lg"
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} disabled={creating} className="btn-primary">
              {creating ? <LoadingSpinner size="sm" /> : 'Publish Notice'}
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" className="input" placeholder="Notice title" value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Content</label>
            <textarea className="input min-h-[120px] resize-y" placeholder="Write your notice..."
              value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <select className="input" value={form.priority}
                onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="label">Target Audience</label>
              <select className="input" value={form.target}
                onChange={(e) => setForm(p => ({ ...p, target: e.target.value }))}>
                <option value="all">All</option>
                <option value="students">Students Only</option>
                <option value="teachers">Teachers Only</option>
                <option value="parents">Parents Only</option>
                <option value="class_specific">Specific Class</option>
              </select>
            </div>
          </div>
          {form.target === 'class_specific' && (
            <div>
              <label className="label">Target Class</label>
              <input type="text" className="input" placeholder="e.g. CSE-A" value={form.target_class}
                onChange={(e) => setForm(p => ({ ...p, target_class: e.target.value }))} />
            </div>
          )}
        </form>
      </Modal>
    </Layout>
  );
};

export default Notices;
