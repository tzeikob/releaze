const fs = require('fs');
const semver = require('semver');
const { isNotString, isNotGiven, isNotArray } = require('../util/validators');

const { readFile, writeFile } = fs.promises;

async function changelog (version, logs) {
  if (isNotGiven(version) || isNotString(version)) {
    throw new Error(`Invalid or missing version argument ${version}`);
  }

  if (isNotGiven(logs) || isNotArray(logs) || logs.length === 0) {
    throw new Error(`Invalid or missing logs argument ${logs}`);
  }

  logs = logs.map((log) => `* ${log}`).join('\n');

  version = semver.clean(version);

  let content = `#v${version}\n${logs}`;

  try {
    const oldContent = await readFile('CHANGELOG.md', 'utf8');
    content += `\n${oldContent}`;
  } catch (error) {
    // Ignore exception only if CHANGELOG.md file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeFile('CHANGELOG.md', content);
}

module.exports = changelog;