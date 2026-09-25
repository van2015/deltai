export class MissingSourceStateError extends Error {
  constructor() {
    super('A change proposal requires a source state');
    this.name = 'MissingSourceStateError';
  }
}
