const { resolve } = require('node:path');
const { config } = require('dotenv');

const workspaceRoot = resolve(__dirname, '..');
const dotenvPath = resolve(workspaceRoot, '.env');

const requiredFirebaseVariables = [
  'NX_PUBLIC_FIREBASE_API_KEY',
  'NX_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NX_PUBLIC_FIREBASE_PROJECT_ID',
  'NX_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NX_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NX_PUBLIC_FIREBASE_APP_ID',
];

const environmentFilePaths = [
  'apps/rewarded-keeper/src/environments/environment.ts',
  'apps/rewarded-keeper/src/environments/environment.prod.ts',
];

function loadDotEnv() {
  config({ path: dotenvPath });
}

function getFirebaseEnvironment() {
  loadDotEnv();

  return Object.fromEntries(
    requiredFirebaseVariables.map((name) => {
      const value = process.env[name];

      if (value === undefined || value === '') {
        throw new Error(`Missing required environment variable: ${name}`);
      }

      return [name, value];
    })
  );
}

function hasGeneratedFirebaseValues(content) {
  return /apiKey:\s*['"][^'"]+['"]/.test(content)
    || /authDomain:\s*['"][^'"]+['"]/.test(content)
    || /appId:\s*['"][^'"]+['"]/.test(content);
}

module.exports = {
  environmentFilePaths,
  getFirebaseEnvironment,
  hasGeneratedFirebaseValues,
  workspaceRoot,
};
