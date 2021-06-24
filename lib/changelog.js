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

  const logListItems = logs.map((log) => `* ${log}`).join('\n');
  let newContent = `#${version}\n${logListItems}`;

  try {
    const content = await readFile(pathToChangelogMD, 'utf8');
    newContent += '\n' + content;
  } catch (error) {
    // Ignore exception only if CHANGELOG.md file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeFile(pathToChangelogMD, newContent);
}

module.exports = changelog;