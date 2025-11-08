'use client';

import { ToggleButton } from './ToggleButton';

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
          <ToggleButton
            key={option}
            option={option}
            isSelected={value === option}
            onClick={() => onChange(option)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
