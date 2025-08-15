import { Month } from '../types';
import { SpecialMonths } from '../data';

/**
 * Determines if a month is a "special" month with reduced hour requirements for auxiliary pioneers.
 * Special months are pulled from the SpecialMonths collection in the database.
 * Only considers special months greater than or equal to the current month.
 * 
 * @param monthId - The month ID in format "YYYY#M" (e.g., "2024#2" for March 2024)
 * @returns Promise<boolean> - true if the month is special (15 hours), false if normal (30 hours)
 */
export const isSpecialMonth = async (monthId: string): Promise<boolean> => {
  const month = Month.fromKey(monthId);
  
  // Get current and future special months from the database
  const specialMonths = await SpecialMonths.getCurrentAndFutureSpecialMonths();
  console.log('Special Months:', specialMonths);
  
  // Check if this year/month combination is in the special months
  return specialMonths.some(sm => sm.year === month.year && sm.month === month.month);
};

/**
 * Gets the hour requirement for auxiliary pioneers for a given month.
 * Uses the SpecialMonths collection to determine special months with reduced requirements.
 * 
 * @param monthId - The month ID in format "YYYY#M"
 * @returns Promise<number> - 15 for special months, 30 for normal months
 */
export const getAuxiliaryPioneerHourRequirement = async (monthId: string): Promise<number> => {
  const isSpecial = await isSpecialMonth(monthId);
  return isSpecial ? 15 : 30;
};

/**
 * Checks if an auxiliary pioneer has met their hour goal for a given month.
 * 
 * @param hours - The number of hours reported
 * @param monthId - The month ID in format "YYYY#M"
 * @returns Promise<boolean> - true if the goal is met, false otherwise
 */
export const hasMetAuxiliaryPioneerGoal = async (hours: number | undefined, monthId: string): Promise<boolean> => {
  if (!hours) return false;
  const requiredHours = await getAuxiliaryPioneerHourRequirement(monthId);
  return hours >= requiredHours;
};
