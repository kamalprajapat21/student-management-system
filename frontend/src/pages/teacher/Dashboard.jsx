import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, teacherService, noticeService, examService } from '../../services';
import {
  UserGroupIcon, ClipboardDocumentListIcon, ChartBarIcon,
  ExclamationTriangleIcon, TrophyIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [notices, setNotices] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [teacherRes, noticesRes, examsRes] = await Promise.allSettled([
          teacherService.getMyClasses(),
          noticeService.getAll({ limit: 5 }),
          examService.getAll(),
        ]);
        if (teacherRes.status === 'fulfilled') {
          const cls = teacherRes.value.data.classes || [];
          setClasses(cls);
          if (cls.length > 0) {
            setSelectedClass(cls[0]);
          }
        }
        if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data.notices || []);
        if (examsRes.status === 'fulfilled') setUpcomingExams(examsRes.value.data.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      analyticsService.getTeacherClassAnalytics(selectedClass)
        .then(({ data }) => setClassAnalytics(data))
        .catch(() => {});
    }
  }, [selectedClass]);

  const performanceChart = classAnalytics ? {
    labels: classAnalytics.class_analytics?.slice(0, 10).map(s => s.name?.split(' ')[0]) || [],
    datasets: [{
      label: 'Avg Marks',
      data: classAnalytics.class_analytics?.slice(0, 10).map(s => s.average_marks) || [],
      backgroundColor: classAnalytics.class_analytics?.slice(0, 10).map(s =>
        s.risk === 'high' ? '#f87171' : s.risk === 'medium' ? '#fbbf24' : '#34d399'
      ) || [],
      borderRadius: 4,
    }]
  } : null;

  return (
    <Layout title="Teacher Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold">Good day, {user?.full_name?.split(' ')[0]}! 👩‍🏫</h2>
          <p className="text-green-100 mt-1">{user?.department} • {user?.employee_id}</p>
          <div className="flex gap-2 mt-3">
            {classes.map(c => (
              <span key={c} className="bg-white/20 px-3 py-1 rounded-full text-sm">{c}</span>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {classAnalytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard title="Total Students" value={classAnalytics.total_students} icon={UserGroupIcon} color="blue" />
            <StatCard title="Avg Attendance" value={`${classAnalytics.avg_attendance}%`} icon={ClipboardDocumentListIcon}
              color={classAnalytics.avg_attendance >= 75 ? 'green' : 'red'} />
            <StatCard title="Top Performers" value={classAnalytics.top_performers?.length || 0} icon={TrophyIcon} color="yellow" />
            <StatCard title="Students at Risk" value={classAnalytics.weak_students?.length || 0} icon={ExclamationTriangleIcon} color="red" />
          </div>
        )}

        {/* Class Selector */}
        {classes.length > 1 && (
          <div className="flex gap-2">
            {classes.map(c => (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedClass === c ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border'}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? <LoadingSpinner className="py-12" /> : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Chart */}
            <div className="card lg:col-span-2">
              <h3 className="section-title flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-blue-500" />
                Student Performance Overview
              </h3>
              {performanceChart ? (
                <Bar data={performanceChart} options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: v => `${v}%` } },
                    x: { grid: { display: false } }
                  }
                }} />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>
              )}
            </div>

            {/* Notices */}
            <div className="card">
              <h3 className="section-title">Recent Notices</h3>
              {notices.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No notices</p>
              ) : (
                <div className="space-y-3">
                  {notices.map(n => (
                    <div key={n.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{n.created_at?.slice(0, 10)}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/teacher/notices" className="mt-3 block text-sm text-primary-600 font-medium">
                Manage Notices →
              </Link>
            </div>

            {/* Top Performers */}
            <div className="card">
              <h3 className="section-title flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                Top Performers
              </h3>
              {(classAnalytics?.top_performers || []).map((s, i) => (
                <div key={s.student_id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.roll_number}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-600">{s.average_marks?.toFixed(1)}%</p>
                </div>
              ))}
              {!classAnalytics?.top_performers?.length && (
                <p className="text-gray-400 text-sm text-center py-4">No data</p>
              )}
            </div>

            {/* Students at Risk */}
            <div className="card">
              <h3 className="section-title flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                Students at Risk
              </h3>
              {(classAnalytics?.weak_students || []).map((s) => (
                <div key={s.student_id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                    <p className="text-xs text-gray-500">Attendance: {s.attendance_percentage}% | Marks: {s.average_marks?.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
              {!classAnalytics?.weak_students?.length && (
                <p className="text-gray-400 text-sm text-center py-4">No at-risk students ✅</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="card">
              <h3 className="section-title">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { to: '/teacher/attendance', label: 'Mark Attendance', icon: ClipboardDocumentListIcon, color: 'text-blue-500' },
                  { to: '/teacher/assignments', label: 'Upload Assignment', icon: AcademicCapIcon, color: 'text-green-500' },
                  { to: '/teacher/marks', label: 'Upload Marks', icon: ChartBarIcon, color: 'text-purple-500' },
                  { to: '/teacher/notices', label: 'Post Notice', icon: ExclamationTriangleIcon, color: 'text-yellow-500' },
                ].map(({ to, label, icon: Icon, color }) => (
                  <Link key={to} to={to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
