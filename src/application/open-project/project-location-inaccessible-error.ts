export class ProjectLocationInaccessibleError extends Error {
  constructor(path: string) {
    super(`Project location is not accessible: ${path}`);
    this.name = 'ProjectLocationInaccessibleError';
  }
}
