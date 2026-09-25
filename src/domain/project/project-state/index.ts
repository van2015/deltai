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

  getElements(): readonly Element[] {
    return this.projectModel.elements.map((element) => ({ ...element }));
  }

  getRelationships(): readonly Relationship[] {
    return this.projectModel.relationships.map((relationship) => ({ ...relationship }));
  }

  hasSameModelAs(otherState: ProjectState): boolean {
    return (
      sameElements(this.projectModel.elements, otherState.projectModel.elements) &&
      sameRelationships(
        this.projectModel.relationships,
        otherState.projectModel.relationships,
      )
    );
  }
}

function sameElements(left: readonly Element[], right: readonly Element[]): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((element) => {
    const other = right.find((candidate) => candidate.id === element.id);
    return other !== undefined && other.name === element.name;
  });
}

function sameRelationships(
  left: readonly Relationship[],
  right: readonly Relationship[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((relationship) => {
    const other = right.find((candidate) => candidate.id === relationship.id);
    return other !== undefined && other.name === relationship.name;
  });
}
