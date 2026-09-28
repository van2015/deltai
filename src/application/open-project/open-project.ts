import { Project } from '../../domain/project/project.js';
import { ProjectLocation } from '../../domain/project/project-location.js';
import { ProjectState } from '../../domain/project/project-state/project-state.js';
import type { ActiveProjectRegistry } from './active-project-registry.js';
import type { OpenProjectCommand } from './open-project-command.js';
import { ProjectLocationInaccessibleError } from './project-location-inaccessible-error.js';
import { ProjectLocationNotFoundError } from './project-location-not-found-error.js';
import type { ProjectWorkspace } from './project-workspace.js';
import { UnsupportedProjectError } from './unsupported-project-error.js';

export class OpenProject {
  constructor(
    private readonly workspace: ProjectWorkspace,
    private readonly activeProjects: ActiveProjectRegistry,
  ) {}

  async execute(command: OpenProjectCommand): Promise<Project> {
    const location = ProjectLocation.of(command.path);
    const activeProject = this.activeProjects.get();

    if (activeProject?.location?.path === location.path) {
      return activeProject;
    }

    const inspection = await this.workspace.inspect(location);

    if (!inspection.exists) {
      throw new ProjectLocationNotFoundError(location.path);
    }

    if (!inspection.accessible) {
      throw new ProjectLocationInaccessibleError(location.path);
    }

    if (!inspection.supported) {
      throw new UnsupportedProjectError(location.path);
    }

    const initialState = ProjectState.create(location.path, {
      elements: [],
      relationships: [],
    });
    const project = Project.create(initialState, location);

    this.activeProjects.set(project);

    return project;
  }
}
