import React from 'react';

/**
 * LoadingSpinner component - Reusable loading indicator
 * Can be used throughout the app for consistent loading UI
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  fullScreen = false,
  color = '#3d1209' 
}) => {
  // Size variants
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-10 h-10 border-3',
    large: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Spinner */}
      <div 
        className={`${sizeClasses[size]} border-gray-200 border-t-transparent rounded-full animate-spin`}
        style={{ borderTopColor: color }}
        role="status"
        aria-label="Loading"
      />
      
      {/* Message */}
      {message && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  // Fullscreen variant
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
};

/**
 * SkeletonLoader - For table/list loading states
 */
export const SkeletonLoader = ({ rows = 3, columns = 4 }) => {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-12 bg-gray-200 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * CardSkeleton - For card-based loading states
 */
export const CardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-gray-200 rounded-lg" />
            <div className="w-16 h-5 bg-gray-200 rounded-full" />
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded mb-2" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
};

/**
 * ButtonSpinner - Small spinner for button loading states
 */
export const ButtonSpinner = ({ size = 'small' }) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-5 h-5 border-2'
  };

  return (
    <div 
      className={`${sizeClasses[size]} border-white border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
