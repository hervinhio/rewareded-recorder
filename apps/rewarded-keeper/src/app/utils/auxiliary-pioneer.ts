import { Month } from '../types';

/**
 * Determines if a month is a "special" month with reduced hour requirements for auxiliary pioneers.
 * Special months typically include March and April due to special campaigns.
 * 
 * @param monthId - The month ID in format "YYYY#M" (e.g., "2024#2" for March 2024)
 * @returns true if the month is special (15 hours), false if normal (30 hours)
 */
export const isSpecialMonth = (monthId: string): boolean => {
  const month = Month.fromKey(monthId);
  // Month is 0-indexed in JavaScript Date, so March is 2 and April is 3
  return month.month === 2 || month.month === 3;
};

/**
 * Gets the hour requirement for auxiliary pioneers for a given month.
 * 
 * @param monthId - The month ID in format "YYYY#M"
 * @returns 15 for special months (March, April), 30 for normal months
 */
export const getAuxiliaryPioneerHourRequirement = (monthId: string): number => {
  return isSpecialMonth(monthId) ? 15 : 30;
};

/**
 * Checks if an auxiliary pioneer has met their hour goal for a given month.
 * 
 * @param hours - The number of hours reported
 * @param monthId - The month ID in format "YYYY#M"
 * @returns true if the goal is met, false otherwise
 */
export const hasMetAuxiliaryPioneerGoal = (hours: number | undefined, monthId: string): boolean => {
  if (!hours) return false;
  const requiredHours = getAuxiliaryPioneerHourRequirement(monthId);
  return hours >= requiredHours;
};