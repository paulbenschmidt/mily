import { HTMLAttributes, ReactNode } from 'react';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'info';
  children: ReactNode;
}

export default function Alert({ variant = 'info', className = '', children, ...props }: AlertProps) {
  const variantStyles = {
    error: 'bg-danger-50 text-danger-700',
    success: 'bg-success-50 text-success-700',
    info: 'bg-info-50 text-info-700',
  };
  
  return (
    <div 
      className={`p-3 rounded-md text-sm ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
