import { describe, it, expect } from '@jest/globals';
import { 
  isSpecialMonth, 
  getAuxiliaryPioneerHourRequirement, 
  hasMetAuxiliaryPioneerGoal 
} from './auxiliary-pioneer';

describe('Auxiliary Pioneer Utils', () => {
  describe('isSpecialMonth', () => {
    it('should return true for March (month index 2)', () => {
      expect(isSpecialMonth('2024#2')).toBe(true);
      expect(isSpecialMonth('2023#2')).toBe(true);
    });

    it('should return true for April (month index 3)', () => {
      expect(isSpecialMonth('2024#3')).toBe(true);
      expect(isSpecialMonth('2023#3')).toBe(true);
    });

    it('should return false for other months', () => {
      expect(isSpecialMonth('2024#0')).toBe(false); // January
      expect(isSpecialMonth('2024#1')).toBe(false); // February
      expect(isSpecialMonth('2024#4')).toBe(false); // May
      expect(isSpecialMonth('2024#5')).toBe(false); // June
      expect(isSpecialMonth('2024#6')).toBe(false); // July
      expect(isSpecialMonth('2024#7')).toBe(false); // August
      expect(isSpecialMonth('2024#8')).toBe(false); // September
      expect(isSpecialMonth('2024#9')).toBe(false); // October
      expect(isSpecialMonth('2024#10')).toBe(false); // November
      expect(isSpecialMonth('2024#11')).toBe(false); // December
    });
  });

  describe('getAuxiliaryPioneerHourRequirement', () => {
    it('should return 15 hours for special months', () => {
      expect(getAuxiliaryPioneerHourRequirement('2024#2')).toBe(15); // March
      expect(getAuxiliaryPioneerHourRequirement('2024#3')).toBe(15); // April
    });

    it('should return 30 hours for normal months', () => {
      expect(getAuxiliaryPioneerHourRequirement('2024#0')).toBe(30); // January
      expect(getAuxiliaryPioneerHourRequirement('2024#1')).toBe(30); // February
      expect(getAuxiliaryPioneerHourRequirement('2024#4')).toBe(30); // May
      expect(getAuxiliaryPioneerHourRequirement('2024#11')).toBe(30); // December
    });
  });

  describe('hasMetAuxiliaryPioneerGoal', () => {
    describe('for special months (15 hours required)', () => {
      it('should return true when hours meet or exceed 15', () => {
        expect(hasMetAuxiliaryPioneerGoal(15, '2024#2')).toBe(true);
        expect(hasMetAuxiliaryPioneerGoal(16, '2024#2')).toBe(true);
        expect(hasMetAuxiliaryPioneerGoal(30, '2024#3')).toBe(true);
      });

      it('should return false when hours are less than 15', () => {
        expect(hasMetAuxiliaryPioneerGoal(14, '2024#2')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(10, '2024#3')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(0, '2024#2')).toBe(false);
      });
    });

    describe('for normal months (30 hours required)', () => {
      it('should return true when hours meet or exceed 30', () => {
        expect(hasMetAuxiliaryPioneerGoal(30, '2024#0')).toBe(true);
        expect(hasMetAuxiliaryPioneerGoal(31, '2024#1')).toBe(true);
        expect(hasMetAuxiliaryPioneerGoal(50, '2024#4')).toBe(true);
      });

      it('should return false when hours are less than 30', () => {
        expect(hasMetAuxiliaryPioneerGoal(29, '2024#0')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(15, '2024#1')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(0, '2024#4')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false when hours is undefined', () => {
        expect(hasMetAuxiliaryPioneerGoal(undefined, '2024#2')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(undefined, '2024#0')).toBe(false);
      });

      it('should handle 0 hours correctly', () => {
        expect(hasMetAuxiliaryPioneerGoal(0, '2024#2')).toBe(false);
        expect(hasMetAuxiliaryPioneerGoal(0, '2024#0')).toBe(false);
      });
    });
  });
});