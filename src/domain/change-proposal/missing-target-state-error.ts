export class MissingTargetStateError extends Error {
  constructor() {
    super('A change proposal requires a target state');
    this.name = 'MissingTargetStateError';
  }
}
