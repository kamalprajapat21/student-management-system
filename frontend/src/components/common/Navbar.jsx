import React from 'react';
import NotificationBell from './NotificationBell';
import DarkModeToggle from './DarkModeToggle';
import { useAuth } from '../../context/AuthContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Navbar = ({ title }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="lg:hidden w-8" /> {/* space for hamburger */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white hidden sm:block">
          {title || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-48"
          />
        </div>
        <DarkModeToggle />
        <NotificationBell />
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center overflow-hidden">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                {user?.full_name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user?.full_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
