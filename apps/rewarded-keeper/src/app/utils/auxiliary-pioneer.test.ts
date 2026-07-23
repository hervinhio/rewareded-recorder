import { 
  isSpecialMonth, 
  getAuxiliaryPioneerHourRequirement, 
  hasMetAuxiliaryPioneerGoal 
} from './auxiliary-pioneer';
import { SpecialMonths } from '../data';

// Mock the SpecialMonths module
jest.mock('../data', () => ({
  SpecialMonths: {
    getCurrentAndFutureSpecialMonths: jest.fn(),
  },
}));

const mockSpecialMonths = SpecialMonths as jest.Mocked<typeof SpecialMonths>;

describe('Auxiliary Pioneer Utils', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Default mock: March and April 2024 are special months
    mockSpecialMonths.getCurrentAndFutureSpecialMonths.mockResolvedValue([
      { reason: 'Memorial Campaign', year: 2024, month: 2 }, // March
      { reason: 'Special Campaign', year: 2024, month: 3 },  // April
      { reason: 'Memorial Campaign', year: 2023, month: 2 }, // March 2023
      { reason: 'Special Campaign', year: 2023, month: 3 },  // April 2023
    ]);
  });

  describe('isSpecialMonth', () => {
    it('should return true for March (month index 2)', async () => {
      expect(await isSpecialMonth('2024#2')).toBe(true);
      expect(await isSpecialMonth('2023#2')).toBe(true);
    });

    it('should return true for April (month index 3)', async () => {
      expect(await isSpecialMonth('2024#3')).toBe(true);
      expect(await isSpecialMonth('2023#3')).toBe(true);
    });

    it('should return false for other months', async () => {
      expect(await isSpecialMonth('2024#0')).toBe(false); // January
      expect(await isSpecialMonth('2024#1')).toBe(false); // February
      expect(await isSpecialMonth('2024#4')).toBe(false); // May
      expect(await isSpecialMonth('2024#5')).toBe(false); // June
      expect(await isSpecialMonth('2024#6')).toBe(false); // July
      expect(await isSpecialMonth('2024#7')).toBe(false); // August
      expect(await isSpecialMonth('2024#8')).toBe(false); // September
      expect(await isSpecialMonth('2024#9')).toBe(false); // October
      expect(await isSpecialMonth('2024#10')).toBe(false); // November
      expect(await isSpecialMonth('2024#11')).toBe(false); // December
    });

    it('should return false when no special months are configured', async () => {
      mockSpecialMonths.getCurrentAndFutureSpecialMonths.mockResolvedValue([]);
      
      expect(await isSpecialMonth('2024#2')).toBe(false);
      expect(await isSpecialMonth('2024#3')).toBe(false);
    });
  });

  describe('getAuxiliaryPioneerHourRequirement', () => {
    it('should return 15 hours for special months', async () => {
      expect(await getAuxiliaryPioneerHourRequirement('2024#2')).toBe(15); // March
      expect(await getAuxiliaryPioneerHourRequirement('2024#3')).toBe(15); // April
    });

    it('should return 30 hours for normal months', async () => {
      expect(await getAuxiliaryPioneerHourRequirement('2024#0')).toBe(30); // January
      expect(await getAuxiliaryPioneerHourRequirement('2024#1')).toBe(30); // February
      expect(await getAuxiliaryPioneerHourRequirement('2024#4')).toBe(30); // May
      expect(await getAuxiliaryPioneerHourRequirement('2024#11')).toBe(30); // December
    });
  });

  describe('hasMetAuxiliaryPioneerGoal', () => {
    describe('for special months (15 hours required)', () => {
      it('should return true when hours meet or exceed 15', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(15, '2024#2')).toBe(true);
        expect(await hasMetAuxiliaryPioneerGoal(16, '2024#2')).toBe(true);
        expect(await hasMetAuxiliaryPioneerGoal(30, '2024#3')).toBe(true);
      });

      it('should return false when hours are less than 15', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(14, '2024#2')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(10, '2024#3')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(0, '2024#2')).toBe(false);
      });
    });

    describe('for normal months (30 hours required)', () => {
      it('should return true when hours meet or exceed 30', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(30, '2024#0')).toBe(true);
        expect(await hasMetAuxiliaryPioneerGoal(31, '2024#1')).toBe(true);
        expect(await hasMetAuxiliaryPioneerGoal(50, '2024#4')).toBe(true);
      });

      it('should return false when hours are less than 30', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(29, '2024#0')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(15, '2024#1')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(0, '2024#4')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false when hours is undefined', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(undefined, '2024#2')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(undefined, '2024#0')).toBe(false);
      });

      it('should handle 0 hours correctly', async () => {
        expect(await hasMetAuxiliaryPioneerGoal(0, '2024#2')).toBe(false);
        expect(await hasMetAuxiliaryPioneerGoal(0, '2024#0')).toBe(false);
      });
    });
  });
});
