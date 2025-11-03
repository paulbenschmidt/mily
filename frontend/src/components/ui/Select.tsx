import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none';
    const normalStyles = 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500';
    const errorStyles = 'border-danger-300 focus:ring-danger-500 focus:border-danger-500';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
