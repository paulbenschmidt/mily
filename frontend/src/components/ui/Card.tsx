import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`border-b border-secondary-200 px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = '', children, ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
