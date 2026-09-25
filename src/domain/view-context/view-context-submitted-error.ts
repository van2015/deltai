export class ViewContextSubmittedError extends Error {
  constructor() {
    super('ViewContext cannot be modified after submission');
    this.name = 'ViewContextSubmittedError';
  }
}
