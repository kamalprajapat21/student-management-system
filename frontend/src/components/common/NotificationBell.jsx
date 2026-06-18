import React, { useState, useRef, useEffect } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const notifIcons = {
  attendance_alert: '📊',
  fee_reminder: '💰',
  assignment_reminder: '📝',
  practical_alert: '🔬',
  exam_alert: '📚',
  notice_alert: '📢',
  leave_update: '✅',
  marks_uploaded: '🎯',
  general: '🔔',
};

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                <CheckIcon className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notif.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl mt-0.5">{notifIcons[notif.notification_type] || '🔔'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!notif.is_read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }) : ''}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <a href="/notifications" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all notifications →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
