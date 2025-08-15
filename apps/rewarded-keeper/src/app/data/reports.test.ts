import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Reports } from './reports';
import { Publishers } from './publishers';
import { Report, Publisher, PublisherActivityStatus } from '../types';
import { store } from './store';
import { hasMetAuxiliaryPioneerGoal } from '../utils';

// Mock Firebase
jest.mock('../auth/authentication', () => ({
  auth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({})),
    signOut: jest.fn(() => Promise.resolve({})),
    getAuth: {},
    currentUser: { uid: 'test-user' }
  })),
  getAuth: () => ({}),
  connectAuthEmulator: () => {},
  GoogleAuthProvider: function() {},
}));
jest.mock('../utils/auxiliary-pioneer');
jest.mock('firebase/firestore');
jest.mock('firebase/app');
jest.mock('firebase/auth', () => ({
  auth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(() => Promise.resolve({})),
    signOut: jest.fn(() => Promise.resolve({})),
    getAuth: {},
    currentUser: { uid: 'test-user' }
  })),
  getAuth: () => ({}),
  connectAuthEmulator: () => {},
  GoogleAuthProvider: function() {},
}));

jest.mock('./store', () => ({
  store: {
    getState: jest.fn(() => ({
      publishers: {
        publishers: []
      }
    })),
    dispatch: jest.fn()
  }
}));

// Mock Publishers.save
jest.mock('./publishers', () => ({
  Publishers: {
    save: jest.fn()
  }
}));

describe('Reports - Auxiliary Pioneer Goal Checking', () => {
  let mockPublisher: Publisher;
  let mockReport: Report;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPublisher = {
      id: 'publisher-1',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      groupId: 'group-1',
      address: 'Test Address',
      telephone: '123456789',
      emergencyPhone: '987654321',
      emailAddress: 'john@test.com',
      auxilaryPionierFor: ['2024#2'], // March 2024 (special month)
      activityStatus: PublisherActivityStatus.Active
    };

    mockReport = {
      id: 'report-1',
      publisherId: 'publisher-1',
      monthId: '2024#2', // March 2024
      active: true,
      hours: 10, // Less than required 15 hours for special month
      courses: 2,
      comment: 'Test report',
      submitted: false,
      isFirstReport: false,
      isAPReport: true
    };

    (store.getState as jest.Mock).mockReturnValue({
      publishers: {
        publishers: [mockPublisher]
      }
    });
  });

  describe('checkAuxiliaryPioneerGoal', () => {
    it('should remove month from auxilaryPionierFor when goal not met in special month', async () => {
      // Mock Reports private method for testing
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      
      const result = await checkGoalMethod(mockReport);
      
      expect(Publishers.save).toHaveBeenCalledWith(
        expect.objectContaining({
          auxilaryPionierFor: [] // Month should be removed
        }),
        true,
        false
      );
      
      expect(result.isAPReport).toBe(false);
    });

    it('should keep month when goal is met in special month', async () => {
      mockReport.hours = 15; // Meets 15 hour requirement for special month
      const spy = (hasMetAuxiliaryPioneerGoal as any).mockResolvedValue(true);
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      spy.mockRestore();
      expect(Publishers.save).not.toHaveBeenCalled();
      expect(result.isAPReport).toBe(true);
    });

    it('should remove month from auxilaryPionierFor when goal not met in normal month', async () => {
      mockReport.monthId = '2024#0'; // January 2024 (normal month, requires 30 hours)
      mockReport.hours = 25; // Less than required 30 hours
      mockPublisher.auxilaryPionierFor = ['2024#0'];
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      expect(Publishers.save).toHaveBeenCalledWith(
        expect.objectContaining({
          auxilaryPionierFor: [] // Month should be removed
        }),
        true,
        false
      );
      
      expect(result.isAPReport).toBe(false);
    });

    it('should keep month when goal is met in normal month', async () => {
      mockReport.monthId = '2024#0'; // January 2024 (normal month)
      mockReport.hours = 30; // Meets 30 hour requirement
      mockPublisher.auxilaryPionierFor = ['2024#0'];
      const spy = (hasMetAuxiliaryPioneerGoal as any).mockResolvedValue(true);
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      spy.mockRestore();
      expect(Publishers.save).not.toHaveBeenCalled();
      expect(result.isAPReport).toBe(true);
    });

    it('should not affect permanent auxiliary pioneers', async () => {
      mockPublisher.isPermanentAuxilaryPioneer = true;
      mockReport.hours = 5; // Very low hours
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      expect(Publishers.save).not.toHaveBeenCalled();
      expect(result.isAPReport).toBe(true); // Should remain true for permanent pioneers
    });

    it('should handle reports for non-auxiliary pioneers', async () => {
      mockPublisher.auxilaryPionierFor = []; // Not an auxiliary pioneer for any month
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      expect(Publishers.save).not.toHaveBeenCalled();
      expect(result.isAPReport).toBe(false);
    });

    it('should handle missing publisher gracefully', async () => {
      (store.getState as jest.Mock).mockReturnValue({
        publishers: {
          publishers: [] // No publishers
        }
      });
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      const result = await checkGoalMethod(mockReport);
      
      expect(Publishers.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockReport); // Should return original report unchanged
    });

    it('should preserve other months in auxilaryPionierFor array', async () => {
      mockPublisher.auxilaryPionierFor = ['2024#2', '2024#3', '2024#4']; // March, April, May
      mockReport.monthId = '2024#2'; // March - goal not met
      mockReport.hours = 10; // Less than 15 required
      
      const checkGoalMethod = (Reports as any).checkAuxiliaryPioneerGoal;
      await checkGoalMethod(mockReport);
      
      expect(Publishers.save).toHaveBeenCalledWith(
        expect.objectContaining({
          auxilaryPionierFor: ['2024#3', '2024#4'] // Only March should be removed
        }),
        true,
        false
      );
    });
  });
});
