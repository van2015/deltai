import type { ProjectId } from '@/domain/project/project-state/project-id.js';
import type { Project } from '@/domain/project/project.js';
import type { ProjectRepository } from '@/application/analyze-refactorings/project-repository.js';

export class FakeProjectRepository implements ProjectRepository {
  constructor(private readonly project: Project) {}

  async get(_projectId: ProjectId): Promise<Project> {
    return this.project;
  }
}
