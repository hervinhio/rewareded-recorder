const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

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
  if (!existsSync(dotenvPath)) {
    return;
  }

  for (const line of readFileSync(dotenvPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);

    if (!match || process.env[match[1]] !== undefined) {
      continue;
    }

    process.env[match[1]] = parseEnvValue(match[2]);
  }
}

function parseEnvValue(value) {
  const withoutInlineComment = value.replace(/\s+#.*$/, '').trim();
  const quote = withoutInlineComment[0];

  if ((quote === '"' || quote === "'") && withoutInlineComment.endsWith(quote)) {
    const unquoted = withoutInlineComment.slice(1, -1);
    return quote === '"' ? unquoted.replace(/\\n/g, '\n') : unquoted;
  }

  return withoutInlineComment;
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
