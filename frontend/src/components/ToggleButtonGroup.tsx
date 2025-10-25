'use client';

interface ToggleButtonGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  required?: boolean;
}

export function ToggleButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
  required = false,
}: ToggleButtonGroupProps<T>) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`min-w-[90px] px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              disabled
                ? 'bg-secondary-200 text-secondary-400 cursor-wait'
                : value === option
                ? 'bg-primary-600 text-white'
                : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
