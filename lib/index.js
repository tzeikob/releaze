const log = require('./log');

async function changelog ({ from, to, format } = {}) {
  const logs = await log({ from, to, format });

  return logs;
};

module.exports = { changelog };