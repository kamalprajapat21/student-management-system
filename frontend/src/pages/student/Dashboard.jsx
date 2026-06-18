import React, { useEffect, useState } from 'react';
import Layout from '../../components/common/Layout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import {
  analyticsService, attendanceService, examService,
  assignmentService, feeService, noticeService, aiService
} from '../../services';
import {
  ClipboardDocumentListIcon, CurrencyRupeeIcon,
  AcademicCapIcon, BookOpenIcon, ExclamationTriangleIcon,
  CpuChipIcon, BellIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement);

const StudentDashboard = () => {
  const { user } = useAuth();
  const studentId = user?.id;

  const [analytics, setAnalytics] = useState(null);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [fees, setFees] = useState(null);
  const [notices, setNotices] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      if (!studentId) return;
      try {
        const [analyticsRes, examsRes, assignmentsRes, feesRes, noticesRes] = await Promise.allSettled([
          analyticsService.getStudentAnalytics(studentId),
          examService.getUpcoming(),
          assignmentService.getAll(),
          feeService.getStudentFees(studentId),
          noticeService.getAll({ limit: 5 }),
        ]);

        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data);
        if (examsRes.status === 'fulfilled') setUpcomingExams(examsRes.value.data.slice(0, 5));
        if (assignmentsRes.status === 'fulfilled') {
          const pending = assignmentsRes.value.data.filter(a => a.submission_status === 'not_submitted');
          setPendingAssignments(pending.slice(0, 5));
        }
        if (feesRes.status === 'fulfilled') setFees(feesRes.value.data);
        if (noticesRes.status === 'fulfilled') setNotices(noticesRes.value.data.notices || []);

        // AI insights (non-blocking)
        try {
          const aiRes = await aiService.getAIDashboard(studentId);
          setAiInsights(aiRes.data);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [studentId]);

  const attendancePct = analytics?.attendance?.percentage || 0;
  const assignmentRate = analytics?.assignments?.completion_rate || 0;

  // Chart data
  const attendanceDonut = {
    labels: ['Present', 'Absent'],
    datasets: [{
      data: [analytics?.attendance?.present || 0, analytics?.attendance?.total - analytics?.attendance?.present || 0],
      backgroundColor: ['#22c55e', '#f87171'],
      borderWidth: 0,
    }]
  };

  const subjectMarksBar = {
    labels: Object.keys(analytics?.marks?.by_subject || {}),
    datasets: [{
      label: 'Average Score (%)',
      data: Object.values(analytics?.marks?.by_subject || {}).map(s =>
        s.total > 0 ? Math.round((s.obtained / s.total) * 100) : 0
      ),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  };

  if (loading) return <Layout title="Dashboard"><LoadingSpinner size="lg" className="mt-20" /></Layout>;

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user?.full_name?.split(' ')[0]}! 👋</h2>
              <p className="text-primary-100 mt-1">
                {user?.department} • {user?.class_name} • Semester {user?.semester}
              </p>
              {aiInsights?.performance_prediction?.risk_level && (
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  aiInsights.performance_prediction.risk_level === 'low'
                    ? 'bg-green-500/20 text-green-100'
                    : aiInsights.performance_prediction.risk_level === 'medium'
                    ? 'bg-yellow-500/20 text-yellow-100'
                    : 'bg-red-500/20 text-red-100'
                }`}>
                  <CpuChipIcon className="w-4 h-4" />
                  AI Risk: {aiInsights.performance_prediction.risk_level.charAt(0).toUpperCase() + aiInsights.performance_prediction.risk_level.slice(1)}
                </div>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-primary-100 text-sm">Today</p>
              <p className="text-white font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Attendance"
            value={`${attendancePct}%`}
            icon={ClipboardDocumentListIcon}
            color={attendancePct >= 75 ? 'green' : attendancePct >= 60 ? 'yellow' : 'red'}
            subtitle={attendancePct >= 75 ? '✅ Safe' : '⚠️ Below 75%'}
          />
          <StatCard
            title="Pending Assignments"
            value={pendingAssignments.length}
            icon={BookOpenIcon}
            color="blue"
            subtitle={`${analytics?.assignments?.completion_rate || 0}% completed`}
          />
          <StatCard
            title="Fee Due"
            value={`₹${fees?.summary?.total_due?.toFixed(0) || '0'}`}
            icon={CurrencyRupeeIcon}
            color={fees?.summary?.total_due > 0 ? 'red' : 'green'}
            subtitle={fees?.summary?.total_due > 0 ? 'Payment pending' : 'All clear!'}
          />
          <StatCard
            title="Upcoming Exams"
            value={upcomingExams.length}
            icon={AcademicCapIcon}
            color="purple"
            subtitle="Next 30 days"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Donut */}
          <div className="card">
            <h3 className="section-title">Attendance Overview</h3>
            <div className="flex items-center justify-center">
              <div className="w-48 h-48">
                <Doughnut
                  data={attendanceDonut}
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 } } }
                    }
                  }}
                />
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendancePct}%</p>
              <p className={`text-sm font-medium ${attendancePct >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                {attendancePct >= 75 ? '✅ Safe' : attendancePct >= 60 ? '⚠️ Warning' : '🔴 Critical'}
              </p>
            </div>
          </div>

          {/* Subject Marks */}
          <div className="card lg:col-span-2">
            <h3 className="section-title">Subject-wise Performance</h3>
            {Object.keys(analytics?.marks?.by_subject || {}).length > 0 ? (
              <Bar
                data={subjectMarksBar}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400">No marks data yet</div>
            )}
          </div>
        </div>

        {/* Bottom Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Exams */}
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-purple-500" />
              Upcoming Exams
            </h3>
            {upcomingExams.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No upcoming exams</p>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.subject}</p>
                      <p className="text-xs text-gray-500">{exam.exam_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-primary-600">{exam.exam_date}</p>
                      <p className="text-xs text-gray-500">{exam.start_time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Assignments */}
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <BookOpenIcon className="w-5 h-5 text-blue-500" />
              Pending Assignments
            </h3>
            {pendingAssignments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">All assignments submitted! ✅</p>
            ) : (
              <div className="space-y-3">
                {pendingAssignments.map((assignment) => {
                  const due = new Date(assignment.due_date);
                  const isOverdue = due < new Date();
                  return (
                    <div key={assignment.id} className={`p-3 rounded-lg ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{assignment.title}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500">{assignment.subject}</span>
                        <span className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-primary-600'}`}>
                          {isOverdue ? 'Overdue' : `Due: ${assignment.due_date?.slice(0, 10)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notices */}
          <div className="card">
            <h3 className="section-title flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-yellow-500" />
              Latest Notices
            </h3>
            {notices.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No notices</p>
            ) : (
              <div className="space-y-3">
                {notices.map((notice) => (
                  <div key={notice.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      {notice.priority === 'urgent' && <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notice.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{notice.content?.slice(0, 80)}...</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="card border-l-4 border-l-purple-500">
            <div className="flex items-center gap-2 mb-4">
              <CpuChipIcon className="w-5 h-5 text-purple-500" />
              <h3 className="section-title mb-0">AI-Powered Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">PERFORMANCE RISK</p>
                <p className={`text-xl font-bold capitalize ${
                  aiInsights.performance_prediction?.risk_level === 'low' ? 'text-green-600' :
                  aiInsights.performance_prediction?.risk_level === 'medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {aiInsights.performance_prediction?.risk_level || 'N/A'}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">PREDICTED ATTENDANCE</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {aiInsights.attendance_prediction?.predicted_final_percentage || 0}%
                </p>
                <p className={`text-xs capitalize ${
                  aiInsights.attendance_prediction?.status === 'safe' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {aiInsights.attendance_prediction?.status}
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">RECOMMENDATIONS</p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {aiInsights.recommendations?.recommendations?.length || 0}
                </p>
                <p className="text-xs text-gray-500">subjects to focus on</p>
              </div>
            </div>
            {aiInsights.performance_prediction?.recommendations?.length > 0 && (
              <ul className="mt-4 space-y-1">
                {aiInsights.performance_prediction.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
