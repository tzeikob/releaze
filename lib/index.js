const gitlog = require('./gitlog');

async function changelog (from, to, format) {
  const logs = await gitlog(from, to, format);

  return logs;
};

module.exports = { changelog };