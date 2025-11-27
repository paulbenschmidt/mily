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
