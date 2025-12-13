/**
 * Process and validate date inputs for event creation/editing
 * @param year - Year as string
 * @param month - Month as string (optional)
 * @param day - Day as string (optional)
 * @returns Validated date components with approximation flags
 * @throws Error if validation fails
 */
export function processDateInputs(year: string, month: string, day: string) {
  // Validate year
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
    throw new Error('Please enter a valid year between 1900 and ' + (currentYear + 1));
  }

  // Provide default values
  let monthNum = 1;
  let isMonthApproximate = true;
  let dayNum = 1;
  let isDayApproximate = true;

  // Reassign month and day if provided
  if (month) {
    monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error('Please select a valid month');
    }
    isMonthApproximate = false;

    if (day) {
      dayNum = parseInt(day);
      // Validate day is valid for the selected month/year
      const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
      if (isNaN(dayNum) || dayNum < 1 || dayNum > daysInMonth) {
        throw new Error('Please enter a valid day between 1 and ' + daysInMonth);
      }
      isDayApproximate = false;
    }
  }

  return {
    yearNum,
    monthNum,
    dayNum,
    isMonthApproximate,
    isDayApproximate,
  };
}

/**
 * Format an event date string for display
 * @param dateString - Date in YYYY-MM-DD format
 * @param isDayApproximate - Whether the day is approximate (will be hidden)
 * @param isMonthApproximate - Whether the month is approximate (will be hidden)
 * @param abbreviated - Whether to use abbreviated month names (e.g., "May" vs "May")
 * @returns Formatted date string
 */
export function formatEventDate(
  dateString: string,
  isDayApproximate: boolean,
  isMonthApproximate: boolean,
  abbreviated: boolean = false
): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const monthStr = isMonthApproximate
    ? null
    : date.toLocaleDateString('en-US', { month: abbreviated ? 'short' : 'long' });
  const dayStr = isDayApproximate ? null : date.getDate().toString();
  const yearStr = year.toString();

  if (monthStr && dayStr) {
    return `${monthStr} ${dayStr}, ${yearStr}`;
  }
  if (monthStr) {
    return `${monthStr} ${yearStr}`;
  }
  return yearStr;
}
