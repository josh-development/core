class CustomError extends Error {

  constructor(message, name = null) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = name || 'JoshError';
    this.message = `\x1b[31m${message}\x1b[0m`;
  }

}

module.exports = CustomError;
