const path = require('path');
const fs = require('fs');
const ChangelogError = require('./errors/changelog-error');
const { isNotString } = require('./util/validators');

const { readFile, writeFile } = fs.promises;

const pathToChangelogMD = path.join(process.cwd(), 'CHANGELOG.md');

async function changelog (version, logs) {
  if (!version || isNotString(version)) {
    throw new ChangelogError('Invalid or missing version argument', version);
  }

  if (!logs || !Array.isArray(logs) || logs.length === 0) {
    throw new ChangelogError('Invalid or missing logs argument', logs);
  }

  logs = logs.map((log) => `* ${log}`).join('\n');

  let content = `#${version}\n${logs}`;

  try {
    const oldContent = await readFile(pathToChangelogMD, 'utf8');
    content += `\n${oldContent}`;
  } catch (error) {
    // Ignore exception only if CHANGELOG.md file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeFile(pathToChangelogMD, content);
}

module.exports = changelog;