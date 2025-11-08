'use client';

interface ToggleButtonProps {
  option: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function ToggleButton({
  option,
  isSelected,
  onClick,
  disabled = false,
}: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[90px] px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
        disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : isSelected
          ? 'bg-primary-550 text-white'
          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
      }`}
    >
      {option}
    </button>
  );
}
