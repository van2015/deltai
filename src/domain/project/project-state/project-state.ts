import { randomUUID } from 'node:crypto';

import type { Element } from './element.js';
import type { ProjectId } from './project-id.js';
import type { ProjectModel } from './project-model.js';
import type { ProjectStateId } from './project-state-id.js';
import type { Relationship } from './relationship.js';

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
      ProjectState.sameElements(
        this.projectModel.elements,
        otherState.projectModel.elements,
      ) &&
      ProjectState.sameRelationships(
        this.projectModel.relationships,
        otherState.projectModel.relationships,
      )
    );
  }

  private static sameElements(left: readonly Element[], right: readonly Element[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((element) => {
      const other = right.find((candidate) => candidate.id === element.id);
      return other !== undefined && other.name === element.name;
    });
  }

  private static sameRelationships(
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
}
