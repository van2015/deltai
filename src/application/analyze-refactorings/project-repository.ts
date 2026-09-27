import type { ProjectId } from '../../domain/project/project-state/project-id.js';
import type { Project } from '../../domain/project/project.js';

export interface ProjectRepository {
  get(projectId: ProjectId): Promise<Project>;
}
