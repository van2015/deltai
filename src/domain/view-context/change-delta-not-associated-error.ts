export class ChangeDeltaNotAssociatedError extends Error {
  constructor() {
    super('The view context is not associated with a change delta');
    this.name = 'ChangeDeltaNotAssociatedError';
  }
}
