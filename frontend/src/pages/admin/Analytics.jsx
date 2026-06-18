import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsService } from '../../services';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const AdminAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdminOverview()
      .then(({ data }) => setOverview(data))
      .finally(() => setLoading(false));
  }, []);

  const exportExcel = async () => {
    try {
      const response = await analyticsService.exportExcel();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'analytics_report.xlsx';
      link.click();
    } catch {}
  };

  const deptChartData = overview ? {
    labels: overview.department_distribution?.map(d => d.department) || [],
    datasets: [{
      data: overview.department_distribution?.map(d => d.count) || [],
      backgroundColor: ['#3b82f6','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'],
    }]
  } : null;

  const attendanceChartData = overview ? {
    labels: overview.weekly_attendance?.map(d => d.date) || [],
    datasets: [{
      label: 'Attendance %',
      data: overview.weekly_attendance?.map(d => d.percentage) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }]
  } : null;

  const feeChartData = overview ? {
    labels: ['Paid', 'Pending', 'Overdue'],
    datasets: [{
      data: [overview.fee_stats?.total_paid, overview.fee_stats?.total_pending, overview.fee_stats?.total_overdue],
      backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
    }]
  } : null;

  return (
    <Layout title="Admin Analytics">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="page-title">Analytics Dashboard</h2>
          <button onClick={exportExcel} className="btn-secondary flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export Excel
          </button>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : overview && (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Students', value: overview.total_students || 0, color: 'text-blue-600' },
                { label: 'Total Teachers', value: overview.total_teachers || 0, color: 'text-green-600' },
                { label: 'Total Parents', value: overview.total_parents || 0, color: 'text-purple-600' },
                { label: 'Avg Attendance', value: `${overview.overall_attendance_percentage || 0}%`, color: 'text-orange-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card text-center">
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                  <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2">
                <h3 className="section-title">Weekly Attendance Trend</h3>
                {attendanceChartData && (
                  <Line data={attendanceChartData} options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } } }
                  }} />
                )}
              </div>
              <div className="card">
                <h3 className="section-title">Department Distribution</h3>
                {deptChartData && (
                  <div className="h-64">
                    <Doughnut data={deptChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                )}
              </div>
            </div>

            {/* Fee stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="section-title">Fee Collection Status</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">₹{overview.fee_stats?.total_paid_amount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Collected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-yellow-600">₹{overview.fee_stats?.total_pending_amount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-red-600">₹{overview.fee_stats?.total_overdue_amount?.toLocaleString() || 0}</p>
                    <p className="text-xs text-gray-500">Overdue</p>
                  </div>
                </div>
                {feeChartData && (
                  <div className="h-48">
                    <Doughnut data={feeChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="section-title">Attendance by Department</h3>
                <div className="space-y-3">
                  {overview.department_distribution?.map((dept) => (
                    <div key={dept.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{dept.department}</span>
                        <span className="text-gray-500">{dept.count} students</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${Math.min((dept.count / overview.total_students) * 100 * 3, 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminAnalytics;
