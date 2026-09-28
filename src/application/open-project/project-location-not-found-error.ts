export class ProjectLocationNotFoundError extends Error {
  constructor(path: string) {
    super(`Project location does not exist: ${path}`);
    this.name = 'ProjectLocationNotFoundError';
  }
}
