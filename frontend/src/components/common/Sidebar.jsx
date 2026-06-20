import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, ClipboardList,
  BarChart3, Bell, DollarSign, Calendar, FileText, Brain, Settings,
  UserCheck, BookMarked, ChevronRight, School, FlaskConical
} from 'lucide-react'

const navItems = {
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/student/marks', label: 'Marks & Exams', icon: BookMarked },
    { to: '/student/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/student/fees', label: 'Fees', icon: DollarSign },
    { to: '/student/timetable', label: 'Timetable', icon: Calendar },
    { to: '/student/leaves', label: 'Leave Applications', icon: FileText },
    { to: '/student/notices', label: 'Notices', icon: Bell },
    { to: '/student/ai-insights', label: 'AI Insights', icon: Brain },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/teacher/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/teacher/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/teacher/marks', label: 'Marks', icon: BookMarked },
    { to: '/teacher/practicals', label: 'Practicals', icon: FlaskConical },
    { to: '/teacher/students', label: 'Students', icon: GraduationCap },
    { to: '/teacher/notices', label: 'Notices', icon: Bell },
    { to: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/teachers', label: 'Teachers', icon: Users },
    { to: '/admin/fees', label: 'Fee Management', icon: DollarSign },
    { to: '/admin/notices', label: 'Notices', icon: Bell },
    { to: '/admin/timetable', label: 'Timetable', icon: Calendar },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  parent: [
    { to: '/parent', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const items = navItems[user?.role] || []

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        z-50 transform transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">EduManage AI</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role} Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 group ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">EduManage AI v1.0</p>
        </div>
      </aside>
    </>
  )
}
