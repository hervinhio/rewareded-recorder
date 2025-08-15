import { SpecialMonths } from './special-months';
import { SpecialMonth } from '../types';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
}));

// Mock store
jest.mock('./store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      specialMonths: {
        specialMonths: [],
        loading: false,
      },
    })),
  },
}));

// Mock database
jest.mock('./database', () => ({
  db: {},
}));

describe('SpecialMonths', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a special month with correct data', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      mockAddDoc.mockResolvedValue({ id: 'mock-doc-id' });

      const year = 2024;
      const month = 11; // December (0-indexed)
      const reason = 'Test special month';

      const result = await SpecialMonths.create(year, month, reason);

      expect(result).toEqual({
        year,
        month,
        reason,
      });

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(), // collection reference
        {
          year,
          month,
          reason,
        }
      );
    });

    it('should handle create errors properly', async () => {
      const mockAddDoc = require('firebase/firestore').addDoc;
      const error = new Error('Firebase error');
      mockAddDoc.mockRejectedValue(error);

      await expect(
        SpecialMonths.create(2024, 0, 'Test month')
      ).rejects.toThrow('Firebase error');
    });
  });

  describe('isSpecialMonthByYearAndMonth', () => {
    it('should return true for existing special month', () => {
      const mockStore = require('./store').store;
      mockStore.getState.mockReturnValue({
        specialMonths: {
          specialMonths: [
            { year: 2024, month: 11, reason: 'Christmas' },
            { year: 2024, month: 0, reason: 'New Year' },
          ],
          loading: false,
        },
      });

      expect(SpecialMonths.isSpecialMonthByYearAndMonth(2024, 11)).toBe(true);
      expect(SpecialMonths.isSpecialMonthByYearAndMonth(2024, 0)).toBe(true);
    });

    it('should return false for non-existing special month', () => {
      const mockStore = require('./store').store;
      mockStore.getState.mockReturnValue({
        specialMonths: {
          specialMonths: [
            { year: 2024, month: 11, reason: 'Christmas' },
          ],
          loading: false,
        },
      });

      expect(SpecialMonths.isSpecialMonthByYearAndMonth(2024, 5)).toBe(false);
      expect(SpecialMonths.isSpecialMonthByYearAndMonth(2025, 11)).toBe(false);
    });
  });
});