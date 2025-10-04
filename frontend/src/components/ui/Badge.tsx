import { ReactNode } from 'react';

interface BadgeProps {
  className?: string;
  children: ReactNode;
}

export default function Badge({ className = '', children }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs capitalize ${className}`}>
      {children}
    </span>
  );
}
