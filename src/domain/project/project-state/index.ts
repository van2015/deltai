import { randomUUID } from 'node:crypto';

export type ProjectStateId = string;

export interface Element {
  readonly id: string;
  readonly name: string;
}

export interface ProjectModel {
  readonly elements: readonly Element[];
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
