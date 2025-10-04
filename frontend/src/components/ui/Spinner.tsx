interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-16 w-16 border-2',
    xl: 'h-32 w-32 border-b-2',
  };

  return (
    <div className={`animate-spin rounded-full border-primary-600 ${sizeStyles[size]} ${className}`} />
  );
}
