import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { StatsUtils } from './stats';
import { Reports } from './reports';
import { Publisher, PublisherActivityStatus, Report } from '../types';
import { store } from './store';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  addDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('./database', () => ({
  db: {}
}));

jest.mock('../auth', () => ({
  auth: {
    currentUser: { uid: 'test-user' }
  }
}));

jest.mock('../utils/auxiliary-pioneer', () => ({
  hasMetAuxiliaryPioneerGoal: jest.fn()
}));

jest.mock('./publishers', () => ({
  Publishers: {
    save: jest.fn()
  }
}));

jest.mock('./store', () => ({
  store: {
    getState: jest.fn()
  }
}));

import { getDoc, setDoc, addDoc } from 'firebase/firestore';
import { hasMetAuxiliaryPioneerGoal } from '../utils/auxiliary-pioneer';

describe('Auxiliary Pioneer Tracking Integration', () => {
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
      auxilaryPionierFor: ['2024#2'], // March 2024
      activityStatus: PublisherActivityStatus.Active
    };

    mockReport = {
      id: 'report-1',
      publisherId: 'publisher-1',
      monthId: '2024#2', // March 2024
      active: true,
      hours: 15, // Meets auxiliary pioneer goal
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

  it('should track auxiliary pioneer achievement when report is created with met goal', async () => {
    // Mock auxiliary pioneer goal as met
    (hasMetAuxiliaryPioneerGoal as jest.Mock).mockResolvedValue(true);
    
    // Mock existing empty stats
    const mockSnap = {
      exists: () => true,
      data: () => ({
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersCount: 0,
        auxiliaryPioneersIds: [],
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockSnap);
    (setDoc as jest.Mock).mockResolvedValue(undefined);
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-report-id' });

    // Create the report (this should trigger auxiliary pioneer tracking)
    await Reports.create(mockReport);

    // Verify that the auxiliary pioneer achievement was tracked
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        auxiliaryPioneersCount: 1,
        auxiliaryPioneersIds: ['publisher-1']
      })
    );
  });

  it('should not duplicate publisher in stats when they achieve goal multiple times', async () => {
    // Mock auxiliary pioneer goal as met
    (hasMetAuxiliaryPioneerGoal as jest.Mock).mockResolvedValue(true);
    
    // Mock existing stats with publisher already tracked
    const mockSnap = {
      exists: () => true,
      data: () => ({
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersCount: 1,
        auxiliaryPioneersIds: ['publisher-1'],
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockSnap);
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-report-id' });

    // Create another report for the same publisher
    const secondReport = {
      ...mockReport,
      id: 'report-2',
      monthId: '2024#3' // Different month
    };

    await Reports.create(secondReport);

    // Should not update stats since publisher is already tracked
    expect(setDoc).not.toHaveBeenCalled();
  });

  it('should track multiple different publishers', async () => {
    // Mock auxiliary pioneer goal as met
    (hasMetAuxiliaryPioneerGoal as jest.Mock).mockResolvedValue(true);
    
    // Create second publisher
    const secondPublisher: Publisher = {
      ...mockPublisher,
      id: 'publisher-2',
      name: 'Jane Smith'
    };

    (store.getState as jest.Mock).mockReturnValue({
      publishers: {
        publishers: [mockPublisher, secondPublisher]
      }
    });

    // Mock stats with first publisher already tracked
    const mockSnap = {
      exists: () => true,
      data: () => ({
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersCount: 1,
        auxiliaryPioneersIds: ['publisher-1'],
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockSnap);
    (setDoc as jest.Mock).mockResolvedValue(undefined);
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-report-id' });

    // Create report for second publisher
    const secondReport = {
      ...mockReport,
      id: 'report-2',
      publisherId: 'publisher-2'
    };

    await Reports.create(secondReport);

    // Should add second publisher to stats
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        auxiliaryPioneersCount: 2,
        auxiliaryPioneersIds: ['publisher-1', 'publisher-2']
      })
    );
  });

  it('should not track publishers who do not meet auxiliary pioneer goals', async () => {
    // Mock auxiliary pioneer goal as NOT met
    (hasMetAuxiliaryPioneerGoal as jest.Mock).mockResolvedValue(false);
    
    mockReport.hours = 10; // Low hours

    const mockSnap = {
      exists: () => true,
      data: () => ({
        auxiliaryPioneersCount: 0,
        auxiliaryPioneersIds: [],
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockSnap);
    (addDoc as jest.Mock).mockResolvedValue({ id: 'new-report-id' });

    await Reports.create(mockReport);

    // Should not call setDoc for stats tracking since goal was not met
    expect(setDoc).not.toHaveBeenCalled();
  });
});