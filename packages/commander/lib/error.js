export class CommanderError extends Error {
  constructor(exitCode, code, message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
}

export class InvalidArgumentError extends CommanderError {
  constructor(message) {
    super(1, 'commander.invalidArgument', message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}