export class ElementNotInStateError extends Error {
  constructor(elementId: string) {
    super(`Element "${elementId}" does not exist in the associated project state`);
    this.name = 'ElementNotInStateError';
  }
}
