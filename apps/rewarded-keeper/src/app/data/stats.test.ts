import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { StatsUtils, Stats } from './stats';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock('./database', () => ({
  db: {}
}));

import { doc, setDoc, getDoc } from 'firebase/firestore';

describe('StatsUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAuxiliaryPioneerAchievement', () => {
    it('should add publisher to stats when they achieve auxiliary pioneer goal', async () => {
      const mockStats: Stats = {
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersIds: [],
      };

      const mockSnap = {
        exists: () => true,
        data: () => mockStats
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnap);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.addAuxiliaryPioneerAchievement('publisher-1');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          auxiliaryPioneersIds: ['publisher-1']
        })
      );
    });

    it('should not add publisher if they are already in the list', async () => {
      const mockStats: Stats = {
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersIds: ['publisher-1'],
      };

      const mockSnap = {
        exists: () => true,
        data: () => mockStats
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnap);

      await StatsUtils.addAuxiliaryPioneerAchievement('publisher-1');

      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should add multiple publishers correctly', async () => {
      const mockStats: Stats = {
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        auxiliaryPioneersIds: ['publisher-1'],
      };

      const mockSnap = {
        exists: () => true,
        data: () => mockStats
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnap);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.addAuxiliaryPioneerAchievement('publisher-2');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          auxiliaryPioneersIds: ['publisher-1', 'publisher-2']
        })
      );
    });

    it('should initialize stats if they do not exist', async () => {
      const mockSnap = {
        exists: () => false,
        data: () => null
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnap);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.addAuxiliaryPioneerAchievement('publisher-1');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          auxiliaryPioneersIds: ['publisher-1'],
          gone: 0,
          newComers: 0,
          disfellowshiped: 0,
          newPublishers: 0,
          underRestrictions: 0,
          baptized: 0,
          blamed: 0,
          families: 0,
        })
      );
    });

    it('should handle missing auxiliaryPioneersIds array', async () => {
      const mockStats: any = {
        gone: 0,
        newComers: 0,
        disfellowshiped: 0,
        newPublishers: 0,
        underRestrictions: 0,
        baptized: 0,
        blamed: 0,
        families: 0,
        // auxiliaryPioneersIds is missing
      };

      const mockSnap = {
        exists: () => true,
        data: () => mockStats
      };

      (getDoc as jest.Mock).mockResolvedValue(mockSnap);
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.addAuxiliaryPioneerAchievement('publisher-1');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          auxiliaryPioneersIds: ['publisher-1']
        })
      );
    });

    it('should throw error when Firebase operations fail', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Firebase error'));

      await expect(StatsUtils.addAuxiliaryPioneerAchievement('publisher-1'))
        .rejects.toThrow('Firebase error');
    });
  });

  describe('reset', () => {
    it('should reset stats with auxiliary pioneer fields', async () => {
      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.reset();

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          auxiliaryPioneersIds: [],
        })
      );
    });
  });

  describe('update', () => {
    it('should update stats with auxiliary pioneer fields', async () => {
      const mockStats: Stats = {
        gone: 5,
        newComers: 3,
        disfellowshiped: 1,
        newPublishers: 2,
        underRestrictions: 0,
        baptized: 4,
        blamed: 0,
        families: 25,
        auxiliaryPioneersIds: ['pub-1', 'pub-2', 'pub-3'],
      };

      (setDoc as jest.Mock).mockResolvedValue(undefined);

      await StatsUtils.update(mockStats);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        mockStats
      );
    });
  });
});