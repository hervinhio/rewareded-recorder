import { Month } from '../types';


export const getLastSixMonths = (
  year?: number,
  month?: number,
) => {
  let startDate: Date;

  if (!!year && !!month) {
    startDate = new Date(year, month);
  } else {
    startDate = new Date();
  }
  
  return getNLastMonthsFromX(6, startDate)
};

export const getNLastMonthsFromX = (n: number, x: Date) => {
  const months: Month[] = [];

  for (let inc = 0; inc < n; inc++)  {
    const month = new Month(x.getFullYear(), x.getMonth());
    months.push(month);
    x.setMonth(x.getMonth() - 1);
  }

  return months;
}

export const getLastTwelveMonths = () => {
  return getNLastMonthsFromX(12, new Date());
};
