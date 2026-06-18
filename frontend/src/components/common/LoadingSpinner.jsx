import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

export default LoadingSpinner;
