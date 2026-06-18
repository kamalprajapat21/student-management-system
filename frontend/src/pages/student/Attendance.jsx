import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const statusColors = {
  present: 'badge-green',
  absent: 'badge-red',
  late: 'badge-yellow',
  excused: 'badge-blue',
};

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [subjectWise, setSubjectWise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ subject: '', start_date: '', end_date: '' });

  const fetchAttendance = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [attRes, subRes] = await Promise.all([
        attendanceService.getStudentAttendance(user.id, filter),
        attendanceService.getSubjectWise(user.id),
      ]);
      setAttendance(attRes.data);
      setSubjectWise(subRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, [user?.id]);

  const chartData = {
    labels: subjectWise.map(s => s.subject || s._id),
    datasets: [{
      label: 'Attendance %',
      data: subjectWise.map(s => s.percentage || 0),
      backgroundColor: subjectWise.map(s => (s.percentage || 0) >= 75 ? '#22c55e' : '#f87171'),
      borderRadius: 6,
    }]
  };

  return (
    <Layout title="My Attendance">
      <div className="space-y-6">
        {/* Summary Cards */}
        {attendance?.summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Classes', value: attendance.summary.total, color: 'text-gray-900 dark:text-white' },
              { label: 'Present', value: attendance.summary.present, color: 'text-green-600' },
              { label: 'Absent', value: attendance.summary.absent, color: 'text-red-600' },
              { label: 'Percentage', value: `${attendance.summary.percentage}%`, color: attendance.summary.percentage >= 75 ? 'text-green-600' : 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Status Banner */}
        {attendance?.summary && (
          <div className={`card border-l-4 ${
            attendance.summary.percentage >= 75
              ? 'border-l-green-500 bg-green-50 dark:bg-green-900/10'
              : attendance.summary.percentage >= 60
              ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
              : 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
          }`}>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              Status: <span className={attendance.summary.percentage >= 75 ? 'text-green-600' : attendance.summary.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {attendance.summary.status}
              </span>
            </p>
            {attendance.summary.percentage < 75 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your attendance is below the required 75%. Please attend more classes.
              </p>
            )}
          </div>
        )}

        {/* Subject-wise Chart */}
        <div className="card">
          <h3 className="section-title">Subject-wise Attendance</h3>
          {subjectWise.length > 0 ? (
            <Bar data={chartData} options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
                x: { grid: { display: false } }
              }
            }} />
          ) : (
            <p className="text-gray-400 text-center py-8">No subject-wise data available</p>
          )}
        </div>

        {/* Filters */}
        <div className="card">
          <h3 className="section-title">Attendance Records</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Filter by subject"
              className="input w-40"
              value={filter.subject}
              onChange={(e) => setFilter(p => ({ ...p, subject: e.target.value }))}
            />
            <input
              type="date"
              className="input w-40"
              value={filter.start_date}
              onChange={(e) => setFilter(p => ({ ...p, start_date: e.target.value }))}
            />
            <input
              type="date"
              className="input w-40"
              value={filter.end_date}
              onChange={(e) => setFilter(p => ({ ...p, end_date: e.target.value }))}
            />
            <button onClick={fetchAttendance} className="btn-primary px-4">Apply</button>
          </div>

          {loading ? <LoadingSpinner className="py-8" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Date', 'Subject', 'Status', 'Remarks'].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(attendance?.records || []).map((record, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{record.date}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{record.subject}</td>
                      <td className="py-3 px-4">
                        <span className={`badge ${statusColors[record.status] || 'badge-blue'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{record.remarks || '-'}</td>
                    </tr>
                  ))}
                  {(attendance?.records || []).length === 0 && (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-400">No records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Attendance;
