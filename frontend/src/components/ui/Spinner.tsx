interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
    xl: 'h-32 w-32',
  };

  return (
    <svg className={`animate-spin text-primary-600 ${sizeStyles[size]} ${className}`} style={{ animationDuration: '0.6s' }} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="50 50" />
    </svg>
  );
}
