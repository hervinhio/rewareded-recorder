const {getJestProjects} = require('@nrwl/jest');
import {TextDecoder, TextEncoder} from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

export default {
  projects: getJestProjects(),
  codeCoverage: true,
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/setup.jest.ts'],
  coverageReporters: ['lcov, json'],
  coverageDirectory: './coverage',
};
