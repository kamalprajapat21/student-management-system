import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analyticsService, studentService, teacherService, feeService } from '../../services';
import {
  UserGroupIcon, UsersIcon, CurrencyRupeeIcon,
  ChartBarIcon, AcademicCapIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getAdminOverview()
      .then(({ data }) => setOverview(data))
      .finally(() => setLoading(false));
  }, []);

  const deptChart = {
    labels: (overview?.students_by_department || []).map(d => d._id || d.department || ''),
    datasets: [{
      data: (overview?.students_by_department || []).map(d => d.count),
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    }]
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Admin Control Panel 🏫</h2>
          <p className="text-red-100 mt-1">Manage your institution efficiently</p>
          <p className="text-red-100 text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {loading ? <LoadingSpinner className="py-12" /> : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard title="Total Students" value={overview?.total_students || 0} icon={UserGroupIcon} color="blue" />
              <StatCard title="Total Teachers" value={overview?.total_teachers || 0} icon={UsersIcon} color="green" />
              <StatCard title="Weekly Attendance" value={`${overview?.weekly_attendance?.percentage || 0}%`} icon={ClipboardDocumentListIcon}
                color={overview?.weekly_attendance?.percentage >= 75 ? 'green' : 'red'} />
              <StatCard title="Fee Collected" value={`₹${((overview?.fee_stats?.total_collected || 0) / 1000).toFixed(0)}K`}
                icon={CurrencyRupeeIcon} color="yellow"
                subtitle={`Due: ₹${((overview?.fee_stats?.total_due || 0) / 1000).toFixed(0)}K`} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dept Distribution */}
              <div className="card">
                <h3 className="section-title">Students by Department</h3>
                {deptChart.labels.length > 0 ? (
                  <div className="flex justify-center">
                    <div className="w-64 h-64">
                      <Doughnut data={deptChart} options={{
                        plugins: { legend: { position: 'right', labels: { padding: 12, font: { size: 11 } } } }
                      }} />
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-gray-400">No data</div>
                )}
              </div>

              {/* Fee Stats */}
              <div className="card">
                <h3 className="section-title">Fee Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Collected</span>
                    <span className="text-lg font-bold text-green-600">₹{(overview?.fee_stats?.total_collected || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Due</span>
                    <span className="text-lg font-bold text-red-500">₹{(overview?.fee_stats?.total_due || 0).toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full"
                      style={{
                        width: `${overview?.fee_stats?.total_collected && overview?.fee_stats?.total_collected + overview?.fee_stats?.total_due > 0
                          ? (overview.fee_stats.total_collected / (overview.fee_stats.total_collected + overview.fee_stats.total_due) * 100)
                          : 0}%`
                      }}
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Attendance this week</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Classes Held</span>
                    <span className="font-medium">{overview?.weekly_attendance?.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Students Present</span>
                    <span className="font-medium text-green-600">{overview?.weekly_attendance?.present || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="section-title">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { to: '/admin/students', label: 'Manage Students', icon: UserGroupIcon, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                  { to: '/admin/teachers', label: 'Manage Teachers', icon: UsersIcon, color: 'bg-green-50 dark:bg-green-900/20 text-green-600' },
                  { to: '/admin/fees', label: 'Fee Management', icon: CurrencyRupeeIcon, color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600' },
                  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link key={to} to={to} className={`flex flex-col items-center gap-3 p-4 rounded-xl ${color} hover:opacity-80 transition-opacity`}>
                    <Icon className="w-8 h-8" />
                    <span className="text-sm font-medium text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
