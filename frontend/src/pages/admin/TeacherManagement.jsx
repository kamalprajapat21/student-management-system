import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { teacherService } from '../../services';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const limit = 20;

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data } = await teacherService.getAll({ page, limit, search });
      setTeachers(data.teachers || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeachers(); }, [page]);

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this teacher?')) return;
    try {
      await teacherService.delete(id);
      toast.success('Teacher deactivated');
      fetchTeachers();
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout title="Teacher Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Teachers</h2>
            <p className="text-gray-500 text-sm">{total} total teachers</p>
          </div>
        </div>

        <div className="card">
          <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchTeachers(); }} className="flex gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input pl-9" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        </div>

        <div className="card overflow-x-auto">
          {loading ? <LoadingSpinner className="py-8" /> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  {['Name', 'Employee ID', 'Email', 'Department', 'Subjects', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{t.full_name}</td>
                    <td className="py-3 px-4 text-gray-500">{t.employee_id}</td>
                    <td className="py-3 px-4 text-gray-500">{t.email}</td>
                    <td className="py-3 px-4 text-gray-500">{t.department}</td>
                    <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{t.subjects?.join(', ') || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${t.is_active ? 'badge-green' : 'badge-red'}`}>
                        {t.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {t.is_active && (
                        <button onClick={() => deactivate(t.id)} className="text-red-500 text-sm font-medium hover:text-red-600">
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No teachers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherManagement;
