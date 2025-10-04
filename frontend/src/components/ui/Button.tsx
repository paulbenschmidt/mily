import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'primary' | 'secondary' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', loading = false, fullWidth = false, asChild = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center rounded-md disabled:opacity-50 disabled:pointer-events-none';
    
    const variantStyles = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      primary: 'text-white bg-primary-600 border border-transparent hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500',
      danger: 'text-white bg-danger-600 border border-transparent hover:bg-danger-700 focus:ring-danger-500',
      text: 'text-primary-600 hover:text-primary-700 border-transparent focus:ring-primary-500',
    };
    
    const sizeStyles = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg',
    };
    
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';
    
    // If asChild is true, we clone the child element and pass props to it
    if (asChild && children) {
      const child = children as React.ReactElement;
      return child;
    }
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${disabledStyles} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
