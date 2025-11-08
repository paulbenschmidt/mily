'use client';

import { ToggleButton } from './ToggleButton';

interface MultiToggleButtonGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
}

export function MultiToggleButtonGroup<T extends string>({
  label,
  options,
  values,
  onChange,
  disabled = false,
}: MultiToggleButtonGroupProps<T>) {
  const toggleOption = (option: T) => {
    if (values.includes(option)) {
      onChange(values.filter(v => v !== option));
    } else {
      onChange([...values, option]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-secondary-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2 flex-wrap">
        {options.map((option) => (
          <ToggleButton
            key={option}
            option={option}
            isSelected={values.includes(option)}
            onClick={() => toggleOption(option)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
