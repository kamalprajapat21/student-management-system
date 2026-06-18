import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { attendanceService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const statusOptions = ['present', 'absent', 'late', 'excused'];

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [classReport, setClassReport] = useState([]);

  useEffect(() => {
    if (user?.class_assigned) setClassId(user.class_assigned);
  }, [user]);

  const loadStudents = async () => {
    if (!classId) return toast.error('Enter class ID');
    try {
      const { data } = await fetch(`/api/students/?class_name=${classId}&limit=100`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(r => r.json()).then(d => ({ data: d }));
      setStudents(data.students || []);
      const initial = {};
      (data.students || []).forEach(s => { initial[s.id] = 'present'; });
      setAttendance(initial);
    } catch { toast.error('Failed to load students'); }
  };

  const submitAttendance = async () => {
    if (!classId || !subject) return toast.error('Enter class and subject');
    if (students.length === 0) return toast.error('Load students first');
    setSubmitting(true);
    try {
      const records = students.map(s => ({
        student_id: s.id,
        status: attendance[s.id] || 'absent',
      }));
      await attendanceService.markBulk({
        date, subject, class_id: classId, marked_by: user.id, records
      });
      toast.success('Attendance marked!');
    } catch (err) {
      toast.error('Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <Layout title="Mark Attendance">
      <div className="space-y-6">
        {/* Controls */}
        <div className="card">
          <h3 className="section-title">Attendance Setup</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Class</label>
              <input type="text" className="input" placeholder="e.g. CSE-A" value={classId} onChange={(e) => setClassId(e.target.value)} />
            </div>
            <div>
              <label className="label">Subject</label>
              <input type="text" className="input" placeholder="e.g. Mathematics" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={loadStudents} className="btn-primary w-full">Load Students</button>
            </div>
          </div>
        </div>

        {students.length > 0 && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="card text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="card text-center">
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-2xl font-bold text-red-500">{absentCount}</p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              <button onClick={() => { const a = {}; students.forEach(s => { a[s.id] = 'present'; }); setAttendance(a); }} className="btn-secondary text-sm">Mark All Present</button>
              <button onClick={() => { const a = {}; students.forEach(s => { a[s.id] = 'absent'; }); setAttendance(a); }} className="btn-secondary text-sm">Mark All Absent</button>
            </div>

            {/* Student List */}
            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Student Name</th>
                      <th className="text-left py-3 px-4">Roll No</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {students.map((student, i) => (
                      <tr key={student.id} className={`${attendance[student.id] === 'absent' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                        <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{student.full_name}</td>
                        <td className="py-3 px-4 text-gray-500">{student.roll_number}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {statusOptions.map(status => (
                              <button
                                key={status}
                                onClick={() => setAttendance(p => ({ ...p, [student.id]: status }))}
                                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                                  attendance[student.id] === status
                                    ? status === 'present' ? 'bg-green-500 text-white'
                                      : status === 'absent' ? 'bg-red-500 text-white'
                                      : status === 'late' ? 'bg-yellow-500 text-white'
                                      : 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                                }`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={submitAttendance} disabled={submitting} className="btn-primary px-8">
                  {submitting ? <LoadingSpinner size="sm" /> : 'Submit Attendance'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceManagement;
