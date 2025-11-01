import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant, ...props }) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  const variantClasses = {
    default: 'border-transparent bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100',
    destructive: 'border-transparent bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
    success: 'border-transparent bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    warning: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant || 'default']} ${className || ''}`;

  return <div className={finalClassName} {...props} />;
};