import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { FullPageLoader } from './components/common/LoadingSpinner';
import Chatbot from './components/common/Chatbot';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Attendance from './pages/student/Attendance';
import Assignments from './pages/student/Assignments';
import Fees from './pages/student/Fees';
import Exams from './pages/student/Exams';
import Timetable from './pages/student/Timetable';
import Leaves from './pages/student/Leaves';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import AttendanceManagement from './pages/teacher/AttendanceManagement';

// Parent Pages
import ParentDashboard from './pages/parent/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import StudentManagement from './pages/admin/StudentManagement';

// Lazy-loaded additional pages
const NoticesPage = React.lazy(() => import('./pages/common/Notices'));
const CalendarPage = React.lazy(() => import('./pages/student/Calendar'));
const AIInsights = React.lazy(() => import('./pages/student/AIInsights'));
const TeacherAssignments = React.lazy(() => import('./pages/teacher/AssignmentManagement'));
const TeacherMarks = React.lazy(() => import('./pages/teacher/MarksManagement'));
const TeacherAnalytics = React.lazy(() => import('./pages/teacher/Analytics'));
const TeacherPracticals = React.lazy(() => import('./pages/teacher/PracticalManagement'));
const AdminTeachers = React.lazy(() => import('./pages/admin/TeacherManagement'));
const AdminFees = React.lazy(() => import('./pages/admin/FeeManagement'));
const AdminAnalytics = React.lazy(() => import('./pages/admin/Analytics'));
const AdminTimetable = React.lazy(() => import('./pages/admin/TimetableManagement'));

// Protected Route component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && !(role === 'teacher' && user.role === 'admin')) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
};

// Public Route - redirect if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) {
    const routes = { student: '/student', teacher: '/teacher', parent: '/parent', admin: '/admin' };
    return <Navigate to={routes[user.role] || '/'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<FullPageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="student"><Attendance /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute role="student"><Assignments /></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute role="student"><Fees /></ProtectedRoute>} />
        <Route path="/student/exams" element={<ProtectedRoute role="student"><Exams /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute role="student"><Timetable /></ProtectedRoute>} />
        <Route path="/student/leaves" element={<ProtectedRoute role="student"><Leaves /></ProtectedRoute>} />
        <Route path="/student/calendar" element={<ProtectedRoute role="student"><CalendarPage /></ProtectedRoute>} />
        <Route path="/student/notices" element={<ProtectedRoute role="student"><NoticesPage /></ProtectedRoute>} />
        <Route path="/student/ai" element={<ProtectedRoute role="student"><AIInsights /></ProtectedRoute>} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><AttendanceManagement /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>} />
        <Route path="/teacher/marks" element={<ProtectedRoute role="teacher"><TeacherMarks /></ProtectedRoute>} />
        <Route path="/teacher/practicals" element={<ProtectedRoute role="teacher"><TeacherPracticals /></ProtectedRoute>} />
        <Route path="/teacher/notices" element={<ProtectedRoute role="teacher"><NoticesPage /></ProtectedRoute>} />
        <Route path="/teacher/leaves" element={<ProtectedRoute role="teacher"><NoticesPage /></ProtectedRoute>} />
        <Route path="/teacher/analytics" element={<ProtectedRoute role="teacher"><TeacherAnalytics /></ProtectedRoute>} />

        {/* Parent Routes */}
        <Route path="/parent" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentManagement /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><AdminTeachers /></ProtectedRoute>} />
        <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminFees /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute role="admin"><AdminTimetable /></ProtectedRoute>} />
        <Route path="/admin/notices" element={<ProtectedRoute role="admin"><NoticesPage /></ProtectedRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </React.Suspense>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
            <Chatbot />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #1f2937)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  padding: '12px 16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
