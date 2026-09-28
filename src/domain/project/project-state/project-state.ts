import { randomUUID } from 'node:crypto';

import type { Element } from './element.js';
import type { ProjectId } from './project-id.js';
import type { ProjectModel } from './project-model.js';
import type { ProjectStateId } from './project-state-id.js';
import type { Relationship } from './relationship.js';
import { DuplicateProjectModelIdError } from './duplicate-project-model-id-error.js';

export class ProjectState {
  private static sameElements(left: readonly Element[], right: readonly Element[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    const rightById = new Map(right.map((element) => [element.id, element]));

    return left.every(
      (element) => rightById.get(element.id)?.name === element.name,
    );
  }

  private static sameRelationships(
    left: readonly Relationship[],
    right: readonly Relationship[],
  ): boolean {
    if (left.length !== right.length) {
      return false;
    }

    const rightById = new Map(right.map((relationship) => [relationship.id, relationship]));

    return left.every(
      (relationship) => rightById.get(relationship.id)?.name === relationship.name,
    );
  }

  static create(projectId: ProjectId, model: ProjectModel): ProjectState {
    const elements = ProjectState.snapshotElements(model.elements);
    const relationships = ProjectState.snapshotRelationships(model.relationships);

    return new ProjectState(
      randomUUID(),
      projectId,
      Object.freeze({ elements, relationships }),
    );
  }

  get id(): ProjectStateId {
    return this.stateId;
  }

  get projectId(): ProjectId {
    return this.project;
  }

  private constructor(
    private readonly stateId: ProjectStateId,
    private readonly project: ProjectId,
    private readonly projectModel: ProjectModel,
  ) {}

  private static snapshotElements(elements: readonly Element[]): readonly Element[] {
    const ids = new Set<string>();
    const snapshot = elements.map((element) => {
      if (ids.has(element.id)) {
        throw new DuplicateProjectModelIdError('element', element.id);
      }

      ids.add(element.id);
      return Object.freeze({ ...element });
    });

    return Object.freeze(snapshot);
  }

  private static snapshotRelationships(
    relationships: readonly Relationship[],
  ): readonly Relationship[] {
    const ids = new Set<string>();
    const snapshot = relationships.map((relationship) => {
      if (ids.has(relationship.id)) {
        throw new DuplicateProjectModelIdError('relationship', relationship.id);
      }

      ids.add(relationship.id);
      return Object.freeze({ ...relationship });
    });

    return Object.freeze(snapshot);
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
}
