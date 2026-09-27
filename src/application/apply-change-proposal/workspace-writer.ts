import type { ProjectState } from '../../domain/project/project-state/project-state.js';

export interface WorkspaceWriter {
  apply(targetState: ProjectState): void;
}
