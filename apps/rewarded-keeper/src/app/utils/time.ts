import { Month } from "../types";

const DefaultNMonthsToGet = 5;
const LastMonthOfYear = 11;

export const getLastSixMonths = () => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();

  if (currentMonth < DefaultNMonthsToGet) {
    const monthsCountInPreviousYear = DefaultNMonthsToGet - currentMonth;
    const previousYear = currentYear - 1;
    const monthsCountInCurrentYear = (DefaultNMonthsToGet - monthsCountInPreviousYear) + 1;

    console.log(`Months to get in Current year: ${monthsCountInCurrentYear}, Stating from ${currentMonth}`);
    console.log(`Months to get in Previous year: ${monthsCountInPreviousYear}, Starting from ${LastMonthOfYear}`);
    return [
      ...getLastNMonths(monthsCountInCurrentYear, currentMonth, currentYear),
      ...getLastNMonths(monthsCountInPreviousYear, LastMonthOfYear, previousYear),
    ];
  } else {
    return getLastNMonths(DefaultNMonthsToGet + 1, currentMonth, currentYear);
  }
}

const getLastNMonths = (n: number, currentMonth: number, currentYear: number) => {
  const months = [];

  for (let i = 0; i < n; i++) {
    console.warn(currentMonth - i);
    months.push(new Month(currentYear, currentMonth - i));
  }

  return months;
}

const getCurrentMonth = () => {
  const date = getDateOnPreviousMonth();

  return date.getMonth();
}

const getDateOnPreviousMonth = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);

  return now;
}

const getCurrentYear = () => {
  const date = getDateOnPreviousMonth();

  return date.getFullYear();
}
