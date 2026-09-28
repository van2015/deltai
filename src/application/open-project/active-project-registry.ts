import type { Project } from '../../domain/project/project.js';

export interface ActiveProjectRegistry {
  get(): Project | undefined;
  set(project: Project): void;
}
