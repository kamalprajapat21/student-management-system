import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsService } from '../../services';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TeacherAnalytics = () => {
  const [classId, setClassId] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const { data } = await analyticsService.getTeacherClassAnalytics(classId);
      setAnalytics(data);
    } finally {
      setLoading(false);
    }
  };

  const chartData = analytics ? {
    labels: analytics.class_analytics?.map(s => s.name?.split(' ')[0]) || [],
    datasets: [
      {
        label: 'Attendance %',
        data: analytics.class_analytics?.map(s => s.attendance_percentage) || [],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
      {
        label: 'Avg Marks %',
        data: analytics.class_analytics?.map(s => s.average_marks) || [],
        backgroundColor: '#22c55e',
        borderRadius: 4,
      }
    ]
  } : null;

  return (
    <Layout title="Class Analytics">
      <div className="space-y-6">
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Class ID</label>
              <input type="text" className="input" placeholder="e.g. CSE-A" value={classId} onChange={(e) => setClassId(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={fetch} className="btn-primary px-6">Analyze</button>
            </div>
          </div>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : analytics && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: analytics.total_students },
                { label: 'Avg Attendance', value: `${analytics.avg_attendance}%` },
                { label: 'Top Performers', value: analytics.top_performers?.length || 0 },
                { label: 'At Risk', value: analytics.weak_students?.length || 0 },
              ].map(({ label, value }) => (
                <div key={label} className="card text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="card">
              <h3 className="section-title">Student Performance Overview</h3>
              {chartData && (
                <Bar data={chartData} options={{
                  responsive: true,
                  plugins: { legend: { position: 'top' } },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
                    x: { grid: { display: false } }
                  }
                }} />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="section-title">Top Performers 🏆</h3>
                {analytics.top_performers?.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span className="font-bold text-gray-400 w-6">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500">Att: {s.attendance_percentage}%</p>
                    </div>
                    <span className="text-green-600 font-bold">{s.average_marks?.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 className="section-title">Students at Risk ⚠️</h3>
                {analytics.weak_students?.length === 0 ? (
                  <p className="text-green-600 text-sm text-center py-4">No students at risk! ✅</p>
                ) : analytics.weak_students?.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                      <p className="text-xs text-gray-500">Att: {s.attendance_percentage}% | Marks: {s.average_marks?.toFixed(1)}%</p>
                    </div>
                    <span className="badge badge-red capitalize">{s.risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default TeacherAnalytics;
