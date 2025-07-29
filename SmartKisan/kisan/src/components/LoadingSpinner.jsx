import React from 'react';
import { Leaf } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-neutral-200 border-t-primary-500 rounded-full animate-spin`}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-primary-500 animate-pulse`} />
        </div>
      </div>
      {text && (
        <p className="mt-3 text-sm text-neutral-600 font-medium">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner; 