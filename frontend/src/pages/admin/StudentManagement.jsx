import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { studentService, analyticsService } from '../../services';
import { MagnifyingGlassIcon, ArrowDownTrayIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const limit = 20;

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await studentService.getAll({ page, limit, search, department: dept });
      setStudents(data.students);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [page, dept]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const exportExcel = async () => {
    try {
      const { data } = await analyticsService.exportStudents();
      const url = URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'students.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Exported successfully!');
    } catch { toast.error('Export failed'); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <Layout title="Student Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Students</h2>
            <p className="text-gray-500 text-sm mt-1">{total} total students</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportExcel} className="btn-secondary flex items-center gap-2 text-sm">
              <ArrowDownTrayIcon className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="card">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48 relative">
              <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="input pl-9"
                placeholder="Search by name, roll number, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <input
              type="text"
              className="input w-40"
              placeholder="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            />
            <button type="submit" className="btn-primary px-5">Search</button>
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-x-auto">
          {loading ? <LoadingSpinner className="py-8" /> : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['#', 'Name', 'Roll No', 'Email', 'Department', 'Class', 'Semester', 'Status'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {students.map((student, i) => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-500">{(page - 1) * limit + i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
                            {student.profile_photo ? (
                              <img src={student.profile_photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">
                                {student.full_name?.[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{student.roll_number}</td>
                      <td className="py-3 px-4 text-gray-500">{student.email}</td>
                      <td className="py-3 px-4 text-gray-600">{student.department}</td>
                      <td className="py-3 px-4 text-gray-600">{student.class_name}</td>
                      <td className="py-3 px-4 text-gray-600">{student.semester}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${student.is_active ? 'badge-green' : 'badge-red'}`}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={8} className="py-12 text-center text-gray-400">No students found</td></tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium">{page} / {totalPages}</span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentManagement;
