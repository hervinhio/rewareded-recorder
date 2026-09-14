const { writeFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { getFirebaseEnvironment, workspaceRoot } = require('./env-utils');

const placeholder = process.argv.includes('--placeholder');
const environment = placeholder ? getPlaceholderEnvironment() : getFirebaseEnvironment();

writeEnvironmentFile('apps/rewarded-keeper/src/environments/environment.ts', false);
writeEnvironmentFile('apps/rewarded-keeper/src/environments/environment.prod.ts', true);

if (!placeholder) {
  try {
    execFileSync('git', [
      'update-index',
      '--skip-worktree',
      'apps/rewarded-keeper/src/environments/environment.ts',
      'apps/rewarded-keeper/src/environments/environment.prod.ts',
    ], { cwd: workspaceRoot, stdio: 'ignore' });
  } catch {
    // Git is not required when generating in non-repository environments.
  }
}

function writeEnvironmentFile(relativePath, production) {
  writeFileSync(resolve(workspaceRoot, relativePath), `${renderEnvironment(production)}\n`);
}

function renderEnvironment(production) {
  return `export const environment = {
  production: ${production},
  testing: false,
  firebaseConfig: {
    apiKey: ${quote(environment.NX_PUBLIC_FIREBASE_API_KEY)},
    authDomain: ${quote(environment.NX_PUBLIC_FIREBASE_AUTH_DOMAIN)},
    projectId: ${quote(environment.NX_PUBLIC_FIREBASE_PROJECT_ID)},
    storageBucket: ${quote(environment.NX_PUBLIC_FIREBASE_STORAGE_BUCKET)},
    messagingSenderId: ${quote(environment.NX_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)},
    appId: ${quote(environment.NX_PUBLIC_FIREBASE_APP_ID)},
  },
  ports: {
    functions: 5001,
  },
};`;
}

function quote(value) {
  return JSON.stringify(value);
}

function getPlaceholderEnvironment() {
  return {
    NX_PUBLIC_FIREBASE_API_KEY: '',
    NX_PUBLIC_FIREBASE_AUTH_DOMAIN: '',
    NX_PUBLIC_FIREBASE_PROJECT_ID: '',
    NX_PUBLIC_FIREBASE_STORAGE_BUCKET: '',
    NX_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '',
    NX_PUBLIC_FIREBASE_APP_ID: '',
  };
}
