import { randomUUID } from 'node:crypto';

export type ProjectStateId = string;
export type ProjectId = string;

export interface Element {
  readonly id: string;
  readonly name: string;
}

export interface Relationship {
  readonly id: string;
  readonly name: string;
}

export interface ProjectModel {
  readonly elements: readonly Element[];
  readonly relationships: readonly Relationship[];
}

export class ProjectState {
  private constructor(
    private readonly stateId: ProjectStateId,
    private readonly project: ProjectId,
    private readonly projectModel: ProjectModel,
  ) {}

  static create(projectId: ProjectId, model: ProjectModel): ProjectState {
    return new ProjectState(randomUUID(), projectId, model);
  }

  get id(): ProjectStateId {
    return this.stateId;
  }

  get projectId(): ProjectId {
    return this.project;
  }

  get model(): ProjectModel {
    return this.projectModel;
  }
}
