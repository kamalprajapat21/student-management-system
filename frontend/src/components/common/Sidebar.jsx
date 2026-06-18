import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UserGroupIcon, AcademicCapIcon,
  ClipboardDocumentListIcon, CurrencyRupeeIcon,
  BellAlertIcon, CalendarDaysIcon, DocumentTextIcon,
  ChartBarIcon, CpuChipIcon, ClockIcon, BeakerIcon,
  UserIcon, ArrowLeftOnRectangleIcon, Bars3Icon,
  XMarkIcon, BookOpenIcon, UsersIcon
} from '@heroicons/react/24/outline';

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: HomeIcon },
  { to: '/student/attendance', label: 'Attendance', icon: ClipboardDocumentListIcon },
  { to: '/student/assignments', label: 'Assignments', icon: BookOpenIcon },
  { to: '/student/fees', label: 'Fees', icon: CurrencyRupeeIcon },
  { to: '/student/exams', label: 'Exams & Marks', icon: AcademicCapIcon },
  { to: '/student/timetable', label: 'Timetable', icon: ClockIcon },
  { to: '/student/calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { to: '/student/leaves', label: 'Leave Application', icon: DocumentTextIcon },
  { to: '/student/notices', label: 'Notices', icon: BellAlertIcon },
  { to: '/student/ai', label: 'AI Insights', icon: CpuChipIcon },
  { to: '/student/profile', label: 'Profile', icon: UserIcon },
];

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: HomeIcon },
  { to: '/teacher/attendance', label: 'Attendance', icon: ClipboardDocumentListIcon },
  { to: '/teacher/assignments', label: 'Assignments', icon: BookOpenIcon },
  { to: '/teacher/marks', label: 'Marks', icon: AcademicCapIcon },
  { to: '/teacher/practicals', label: 'Practicals', icon: BeakerIcon },
  { to: '/teacher/notices', label: 'Notices', icon: BellAlertIcon },
  { to: '/teacher/leaves', label: 'Leave Requests', icon: DocumentTextIcon },
  { to: '/teacher/analytics', label: 'Analytics', icon: ChartBarIcon },
];

const parentLinks = [
  { to: '/parent', label: 'Dashboard', icon: HomeIcon },
  { to: '/parent/attendance', label: "Child's Attendance", icon: ClipboardDocumentListIcon },
  { to: '/parent/fees', label: 'Fee Status', icon: CurrencyRupeeIcon },
  { to: '/parent/marks', label: 'Marks & Performance', icon: AcademicCapIcon },
  { to: '/parent/notifications', label: 'Notifications', icon: BellAlertIcon },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: HomeIcon },
  { to: '/admin/students', label: 'Students', icon: UserGroupIcon },
  { to: '/admin/teachers', label: 'Teachers', icon: UsersIcon },
  { to: '/admin/fees', label: 'Fee Management', icon: CurrencyRupeeIcon },
  { to: '/admin/timetable', label: 'Timetable', icon: ClockIcon },
  { to: '/admin/notices', label: 'Notices', icon: BellAlertIcon },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
];

const roleLinks = { student: studentLinks, teacher: teacherLinks, parent: parentLinks, admin: adminLinks };
const roleColors = {
  student: 'from-blue-600 to-blue-700',
  teacher: 'from-green-600 to-green-700',
  parent: 'from-purple-600 to-purple-700',
  admin: 'from-red-600 to-red-700',
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = roleLinks[user?.role] || [];
  const gradient = roleColors[user?.role] || 'from-blue-600 to-blue-700';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Brand */}
      <div className={`bg-gradient-to-r ${gradient} px-4 py-5`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">EduManage</p>
            <p className="text-white/70 text-xs capitalize">{user?.role} Portal</p>
          </div>
        </div>
        {/* User info */}
        <div className="mt-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-semibold text-sm">
                {user?.full_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.full_name}</p>
            <p className="text-white/60 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-sm font-medium"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border"
      >
        <Bars3Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
