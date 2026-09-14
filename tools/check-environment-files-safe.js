const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { execFileSync } = require('node:child_process');
const { environmentFilePaths, hasGeneratedFirebaseValues, workspaceRoot } = require('./env-utils');

const stagedOnly = process.argv.includes('--staged');
const unsafeFiles = stagedOnly ? getUnsafeStagedFiles() : getUnsafeWorkingTreeFiles();

if (unsafeFiles.length > 0) {
  console.error('Generated Firebase environment values must not be committed:');
  for (const filePath of unsafeFiles) {
    console.error(`- ${filePath}`);
  }
  console.error('Commit the placeholder environment files only. Nx will regenerate local/CI values before build and serve.');
  process.exit(1);
}

function getUnsafeWorkingTreeFiles() {
  return environmentFilePaths.filter((filePath) => {
    const absolutePath = resolve(workspaceRoot, filePath);
    return existsSync(absolutePath) && hasGeneratedFirebaseValues(readFileSync(absolutePath, 'utf8'));
  });
}

function getUnsafeStagedFiles() {
  const stagedFiles = new Set(getStagedEnvironmentFiles());

  return environmentFilePaths.filter((filePath) => {
    if (!stagedFiles.has(filePath)) {
      return false;
    }

    let content;

    try {
      content = execFileSync('git', ['show', `:${filePath}`], { cwd: workspaceRoot, encoding: 'utf8' });
    } catch {
      return false;
    }

    return hasGeneratedFirebaseValues(content);
  });
}

function getStagedEnvironmentFiles() {
  const output = execFileSync('git', ['diff', '--cached', '--name-only', '--', ...environmentFilePaths], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });

  return output.split(/\r?\n/).filter(Boolean);
}
