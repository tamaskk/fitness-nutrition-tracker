import { format, parseISO, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Format date for API storage (YYYY-MM-DD)
export const formatDateForAPI = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Format date for display
export const formatDateForDisplay = (dateString: string): string => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'Today';
  }
  
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  
  return format(date, 'MMM d, yyyy');
};

// Format date for input fields
export const formatDateForInput = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

// Get current date string for API
export const getCurrentDateString = (): string => {
  return formatDateForAPI(new Date());
};

// Get date range for current week
export const getCurrentWeekRange = () => {
  const now = new Date();
  return {
    start: formatDateForAPI(startOfWeek(now)),
    end: formatDateForAPI(endOfWeek(now)),
  };
};

// Get date range for current month
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: formatDateForAPI(startOfMonth(now)),
    end: formatDateForAPI(endOfMonth(now)),
  };
};

// Get array of dates for a week
export const getWeekDates = (startDate: Date): string[] => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    dates.push(formatDateForAPI(date));
  }
  return dates;
};

// Get array of dates for a month
export const getMonthDates = (year: number, month: number): string[] => {
  const dates = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    dates.push(formatDateForAPI(new Date(year, month, i)));
  }
  
  return dates;
};

