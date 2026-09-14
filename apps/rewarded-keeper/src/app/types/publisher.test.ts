// Import necessary packages
import {
  isPublisherAuxilaryPionierForMonth,
  isSpecialPublisher,
  Publisher,
  PublisherActivityStatus
} from './publisher';
import { Month } from './month';


jest.mock('firebase/firestore');
jest.mock('firebase/app');
jest.mock('firebase/auth', () => {
  return {
    auth: jest.fn(() => ({
      signInWithEmailAndPassword: jest.fn(() => Promise.resolve({})),
      signOut: jest.fn(() => Promise.resolve({})),
      getAuth: {},
    })),
    getAuth: () => ({}),
    connectAuthEmulator: () => {},
    GoogleAuthProvider: function() {},
  }
});

jest.mock('firebase/functions', () => {
  return {
    functions: jest.fn().mockReturnThis(),
    getFunctions: jest.fn().mockReturnThis(),
    connectFunctionsEmulator: jest.fn().mockReturnThis(),
    httpsCallable: jest.fn().mockReturnThis(),
    call: jest.fn().mockResolvedValue({ data: 'mock data' })
  };
});

describe('Publisher tests', () => {
  describe('isSpecialPublisher Function', () => {

    describe('isSpecialPublisher Function', () => {
      it('should return true if the publisher is special', () => {
        const specialPublisher: Publisher = {
          name: 'Special Publisher',
          firstName: 'Special',
          lastName: 'Publisher',
          groupId: 'Special Group',
          address: 'Special Address',
          telephone: '1234567890',
          emergencyPhone: '0987654321',
          emailAddress: 'email@special.com',
          isPermanentAuxilaryPioneer: true,
          activityStatus: PublisherActivityStatus.Active
        };

        // Let's assume that isSpecialPublisher() is a function in publisher.ts which takes a publisher object and returns
        // a boolean indicating if the Publisher is special or not.
        expect(isSpecialPublisher(specialPublisher)).toBe(true);
      });

      it('should return false if the publisher is not special', () => {
        const normalPublisher: Publisher = {
          name: 'Normal Publisher',
          firstName: 'Normal',
          lastName: 'Publisher',
          groupId: 'Normal Group',
          address: 'Normal Address',
          telephone: '1234567890',
          emergencyPhone: '0987654321',
          emailAddress: 'email@normal.com',
          isPermanentAuxilaryPioneer: false,
          activityStatus: PublisherActivityStatus.Active
        };

        expect(isSpecialPublisher(normalPublisher)).toBe(false);
      });

      it('should return true if the publisher is a regular pionnier', () => {
        const inactiveSpecialPublisher: Publisher = {
          name: 'Inactive Special Publisher',
          firstName: 'Inactive',
          lastName: 'SpecialPublisher',
          groupId: 'Inactive Group',
          address: 'Inactive Address',
          telephone: '1234567890',
          emergencyPhone: '0987654321',
          emailAddress: 'email@inactive.com',
          isRegularPioneer: true,
          activityStatus: PublisherActivityStatus.Inactive
        };

        expect(isSpecialPublisher(inactiveSpecialPublisher)).toBe(true);
      });

      it('should return true if the publisher is a special servant', () => {
        const inactiveSpecialPublisher: Publisher = {
          name: 'Inactive Special Publisher',
          firstName: 'Inactive',
          lastName: 'SpecialPublisher',
          groupId: 'Inactive Group',
          address: 'Inactive Address',
          telephone: '1234567890',
          emergencyPhone: '0987654321',
          emailAddress: 'email@inactive.com',
          isSpecialServant: true,
          activityStatus: PublisherActivityStatus.Inactive
        };

        expect(isSpecialPublisher(inactiveSpecialPublisher)).toBe(true);
      });

      it('should return true if the publisher is a auxiliary pioneer for the month', () => {
        const month = Month.fromKey('2024#10');
        const inactiveSpecialPublisher: Publisher = {
          name: 'Inactive Special Publisher',
          firstName: 'Inactive',
          lastName: 'SpecialPublisher',
          groupId: 'Inactive Group',
          address: 'Inactive Address',
          telephone: '1234567890',
          emergencyPhone: '0987654321',
          emailAddress: 'email@inactive.com',
          auxilaryPionierFor: [month.getKey()],
          activityStatus: PublisherActivityStatus.Inactive
        };

        expect(isSpecialPublisher(inactiveSpecialPublisher, month)).toBe(true);
      });

      it('should handle null or undefined inputs', () => {
        expect(isSpecialPublisher(undefined)).toBe(false);
      });
    });
  });

  describe("isPublisherAuxilaryPionierForMonth Function", () => {
    it("returns true if the publisher is a permanent auxiliary pioneer", () => {
      const testPub: Publisher = {
        name: 'Test Publisher',
        firstName: 'John',
        lastName: 'Doe',
        groupId: 'Test Group',
        address: 'Test Address',
        telephone: '1234567890',
        emergencyPhone: '0987654321',
        emailAddress: 'email@test.com',
        isPermanentAuxilaryPioneer: true,
        activityStatus: PublisherActivityStatus.Active
      };
      expect(isPublisherAuxilaryPionierForMonth(testPub, '01')).toBe(true);
    });

    it("returns true if the publisher is an auxiliary pioneer for a specific month", () => {
      const testPub: Publisher = {
        name: 'Test Publisher',
        firstName: 'John',
        lastName: 'Doe',
        groupId: 'Test Group',
        address: 'Test Address',
        telephone: '1234567890',
        emergencyPhone: '0987654321',
        emailAddress: 'email@test.com',
        auxilaryPionierFor: ['01'],
        activityStatus: PublisherActivityStatus.Active
      };
      expect(isPublisherAuxilaryPionierForMonth(testPub, '01')).toBe(true);
    });

    it("returns false if the publisher is not an auxiliary pioneer", () => {
      const testPub: Publisher = {
        name: 'Test Publisher',
        firstName: 'John',
        lastName: 'Doe',
        groupId: 'Test Group',
        address: 'Test Address',
        telephone: '1234567890',
        emergencyPhone: '0987654321',
        emailAddress: 'email@test.com',
        isPermanentAuxilaryPioneer: false,
        activityStatus: PublisherActivityStatus.Active
      };
      expect(isPublisherAuxilaryPionierForMonth(testPub, '01')).toBe(false);
    });
  });
});
