export class UnsupportedProjectError extends Error {
  constructor(path: string) {
    super(`Project location is not supported: ${path}`);
    this.name = 'UnsupportedProjectError';
  }
}
