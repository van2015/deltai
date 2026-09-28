export class InvalidChangeApplicationError extends Error {
  constructor(message: string) {
    super(`Invalid change application: ${message}`);
    this.name = 'InvalidChangeApplicationError';
  }
}
