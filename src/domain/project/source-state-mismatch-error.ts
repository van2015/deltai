export class SourceStateMismatchError extends Error {
  constructor() {
    super('Proposal source state does not match the current project state');
    this.name = 'SourceStateMismatchError';
  }
}
