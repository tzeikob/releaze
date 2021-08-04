'use strict';

const fs = require('fs');
const semver = require('semver');
const moment = require('moment');
const { isNotString, isNotGiven, isNotArray } = require('../util/validators');

const { readFile, writeFile } = fs.promises;

const filename = 'CHANGELOG.md';

async function changelog (version, logs) {
  if (isNotGiven(version) || isNotString(version)) {
    throw new Error(`Invalid or missing version argument ${version}`);
  }

  if (isNotGiven(logs) || isNotArray(logs)) {
    throw new Error(`Invalid or missing logs argument ${logs}`);
  }

  version = semver.clean(version);

  let content = `v${version} - ${moment().format('MMMM D, YYYY')}\n`;

  logs = logs.map((log) => `* ${log}`).join('\n');

  if (logs !== '') {
    content += `\n${logs}\n`;
  }

  let append = false;

  try {
    const oldContent = await readFile(filename, 'utf8');
    content += `\n${oldContent}`;

    append = true;
  } catch (error) {
    // Ignore exception only if CHANGELOG.md file not exists
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }

  await writeFile(filename, content);

  return { filename, append };
}

module.exports = changelog;