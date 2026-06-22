import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, UserCheck, ClipboardList, BookMarked,
  DollarSign, GraduationCap, Users, BarChart3, Bell
} from 'lucide-react'

const bottomNavItems = {
  student: [
    { to: '/student', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/student/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/student/marks', label: 'Marks', icon: BookMarked },
    { to: '/student/assignments', label: 'Tasks', icon: ClipboardList },
    { to: '/student/fees', label: 'Fees', icon: DollarSign },
  ],
  teacher: [
    { to: '/teacher', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/teacher/attendance', label: 'Attendance', icon: UserCheck },
    { to: '/teacher/assignments', label: 'Tasks', icon: ClipboardList },
    { to: '/teacher/marks', label: 'Marks', icon: BookMarked },
    { to: '/teacher/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  admin: [
    { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/teachers', label: 'Teachers', icon: Users },
    { to: '/admin/fees', label: 'Fees', icon: DollarSign },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
  parent: [
    { to: '/parent', label: 'Home', icon: LayoutDashboard, end: true },
  ],
}

export default function BottomNav() {
  const { user } = useAuth()
  const items = bottomNavItems[user?.role] || []

  if (!user || items.length <= 1) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:hidden z-40 glass border-t border-gray-200 dark:border-gray-700 safe-bottom">
      <div className="flex items-center justify-around px-1 py-1.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[52px] ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`p-1.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={`text-[10px] font-medium leading-none ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
