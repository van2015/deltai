export class ProjectLocationRequiredError extends Error {
  constructor() {
    super('Project analysis requires a project location');
    this.name = 'ProjectLocationRequiredError';
  }
}
