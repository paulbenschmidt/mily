import { TextareaHTMLAttributes, forwardRef } from 'react';

// Exporting since they are used in other components like DescriptionInput
export const baseInputStyles = 'w-full px-3 py-2 border rounded-md transition-colors focus:outline-none placeholder:text-secondary-400';
export const normalInputStyles = 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500';
export const errorInputStyles = 'border-danger-300 focus:ring-danger-500 focus:border-danger-500';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`${baseInputStyles} ${error ? errorInputStyles : normalInputStyles} ${className}`}
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
