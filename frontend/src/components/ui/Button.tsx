import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, fullWidth = false, className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';
    
    const variantStyles = {
      primary: 'text-white bg-primary-600 border border-transparent hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50 focus:ring-primary-500',
      danger: 'text-white bg-danger-600 border border-transparent hover:bg-danger-700 focus:ring-danger-500',
      text: 'text-primary-600 hover:text-primary-700 border-transparent focus:ring-primary-500',
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm rounded',
      md: 'px-4 py-2 text-sm rounded-md',
      lg: 'px-8 py-4 text-lg rounded-lg',
    };
    
    const widthStyles = fullWidth ? 'w-full' : '';
    const disabledStyles = (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '';
    
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

export default Button;
