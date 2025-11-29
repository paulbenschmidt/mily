import { Input, Select } from '@/components/ui';

interface DateInputProps {
  year: string;
  month: string;
  day: string;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onDayChange: (value: string) => void;
  yearId?: string;
  monthId?: string;
  dayId?: string;
  yearLabel?: string;
  monthLabel?: string;
  dayLabel?: string;
  required?: boolean;
}

export function DateInput({
  year,
  month,
  day,
  onYearChange,
  onMonthChange,
  onDayChange,
  yearId = 'year',
  monthId = 'month',
  dayId = 'day',
  yearLabel = 'Year',
  monthLabel = 'Month',
  dayLabel = 'Day',
  required = true,
}: DateInputProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex gap-2">
      <div className="flex-1 min-w-[80px] max-w-[100px]">
        <label htmlFor={yearId} className="block text-sm font-medium text-secondary-700 mb-1">
          {yearLabel}
        </label>
        <Input
          type="number"
          id={yearId}
          placeholder="YYYY"
          value={year}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 4) {
              onYearChange(value);
            }
          }}
          min={1900}
          max={currentYear + 1}
          required={required}
        />
      </div>
      <div className="flex-1 min-w-[120px] max-w-[140px]">
        <label htmlFor={monthId} className="block text-sm font-medium text-secondary-700 mb-1">
          {monthLabel}
        </label>
        <Select
          id={monthId}
          value={month}
          onChange={(e) => onMonthChange(e.target.value)}
        >
          <option value="" disabled hidden>Select</option>
          <option value=""></option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </Select>
      </div>
      <div className="flex-1 min-w-[60px] max-w-[80px]">
        <label htmlFor={dayId} className="block text-sm font-medium text-secondary-700 mb-1">
          {dayLabel}
        </label>
        <Input
          type="number"
          id={dayId}
          placeholder="DD"
          value={day}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 2) {
              onDayChange(value);
            }
          }}
          min={1}
          max={31}
        />
      </div>
    </div>
  );
}
