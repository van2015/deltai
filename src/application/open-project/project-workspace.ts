import type { ProjectLocation } from '../../domain/project/project-location.js';
import type { ProjectInspection } from './project-inspection.js';

export interface ProjectWorkspace {
  inspect(location: ProjectLocation): Promise<ProjectInspection>;
}
