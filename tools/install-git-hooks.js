const { chmodSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { execFileSync } = require('node:child_process');

const workspaceRoot = resolve(__dirname, '..');
const hookPath = resolve(workspaceRoot, '.githooks/pre-commit');

try {
  execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { cwd: workspaceRoot, stdio: 'ignore' });

  if (existsSync(hookPath)) {
    chmodSync(hookPath, 0o755);
  }
} catch {
  // Installing dependencies outside a Git checkout should still succeed.
}
