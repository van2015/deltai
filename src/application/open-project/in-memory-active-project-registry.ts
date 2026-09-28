import type { Project } from '../../domain/project/project.js';
import type { ActiveProjectRegistry } from './active-project-registry.js';

export class InMemoryActiveProjectRegistry implements ActiveProjectRegistry {
  private activeProject: Project | undefined;

  get(): Project | undefined {
    return this.activeProject;
  }

  set(project: Project): void {
    this.activeProject = project;
  }
}
