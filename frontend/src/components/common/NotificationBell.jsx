import React from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationBell() {
  const { unread } = useNotifications()
  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </div>
  )
}
