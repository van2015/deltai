export class ChangeNotInDeltaError extends Error {
  constructor() {
    super('The change does not belong to the associated change delta');
    this.name = 'ChangeNotInDeltaError';
  }
}
