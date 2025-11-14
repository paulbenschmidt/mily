import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none placeholder:text-secondary-400';
    const normalStyles = 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500';
    const errorStyles = 'border-danger-300 focus:ring-danger-500 focus:border-danger-500';

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseStyles} ${error ? errorStyles : normalStyles} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
