import type { ProjectId } from '../../domain/project/project-state/project-id.js';

export class AnalyzeProjectCommand {
  constructor(
    readonly projectId: ProjectId,
    readonly signal?: AbortSignal,
  ) {}
}
