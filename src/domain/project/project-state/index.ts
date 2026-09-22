import { randomUUID } from 'node:crypto';

export type ProjectStateId = string;

export interface ProjectModel {
  readonly elements: readonly unknown[];
  readonly relationships: readonly unknown[];
}

export class ProjectState {
  private constructor(
    private readonly stateId: ProjectStateId,
    private readonly projectModel: ProjectModel,
  ) {}

  static create(model: ProjectModel): ProjectState {
    return new ProjectState(randomUUID(), model);
  }

  get id(): ProjectStateId {
    return this.stateId;
  }

  get model(): ProjectModel {
    return this.projectModel;
  }
}
