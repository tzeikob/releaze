class LogError extends Error {
  constructor (message, context) {
    super(`${message}: ${String(context)}`);

    this.context = context;
  }
}

module.exports = LogError;