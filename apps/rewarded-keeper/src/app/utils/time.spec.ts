import { Month } from '../types';
import { getLastSixMonths } from './time';

describe('utils/time', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getLastSixMonths', () => {
    const year = 2021;

    it('should get last six mons in current year', () => {
      const month = 11;
      const date = new Date(year, month, 22);
      jest.setSystemTime(date);

      const months = getLastSixMonths();

      expect(months).toEqual([
        new Month(year, 10),
        new Month(year, 9),
        new Month(year, 8),
        new Month(year, 7),
        new Month(year, 6),
        new Month(year, 5),
      ]);
    });

    it('should get 3 months in current years and 3 in previous year', () => {
      const previousYear = year - 1;
      const month = 3;
      const date = new Date(year, month, 22);
      jest.setSystemTime(date);

      const months = getLastSixMonths();

      expect(months).toEqual([
        new Month(year, 2),
        new Month(year, 1),
        new Month(year, 0),
        new Month(previousYear, 11),
        new Month(previousYear, 10),
        new Month(previousYear, 9),
      ]);
    });

    it('should get 4 months in current years and 2 in previous year', () => {
      const previousYear = year - 1;
      const month = 4;
      const date = new Date(year, month, 22);

      jest.setSystemTime(date);

      const months = getLastSixMonths();

      expect(months).toEqual([
        new Month(year, 3),
        new Month(year, 2),
        new Month(year, 1),
        new Month(year, 0),
        new Month(previousYear, 11),
        new Month(previousYear, 10),
      ]);
    });

    it('should get 1 months in current years and 5 in previous year', () => {
      const previousYear = year - 1;
      const month = 1;
      const date = new Date(year, month, 22);

      jest.setSystemTime(date);

      const months = getLastSixMonths();

      expect(months).toEqual([
        new Month(year, 0),
        new Month(previousYear, 11),
        new Month(previousYear, 10),
        new Month(previousYear, 9),
        new Month(previousYear, 8),
        new Month(previousYear, 7),
      ]);
    });

    it('should get 5 months in current years and 1 in previous year', () => {
      const previousYear = year - 1;
      const month = 5;
      const date = new Date(year, month, 22);

      jest.setSystemTime(date);

      const months = getLastSixMonths();

      expect(months).toEqual([
        new Month(year, 4),
        new Month(year, 3),
        new Month(year, 2),
        new Month(year, 1),
        new Month(year, 0),
        new Month(previousYear, 11),
      ]);
    });
  });
});
