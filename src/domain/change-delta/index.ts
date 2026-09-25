import type {
  Element,
  ProjectState,
  Relationship,
} from '../project/project-state/index.js';

export enum ChangeType {
  Added = 'Added',
  Removed = 'Removed',
  Modified = 'Modified',
}

export interface ElementChange {
  readonly type: ChangeType;
  readonly element: Element;
}

export interface RelationshipChange {
  readonly type: ChangeType;
  readonly relationship: Relationship;
}

export type Change = ElementChange | RelationshipChange;

export class ChangeDelta {
  private constructor(
    private readonly source: ProjectState,
    private readonly target: ProjectState,
    private readonly changeList: readonly Change[],
  ) {}

  static between(sourceState: ProjectState, targetState: ProjectState): ChangeDelta {
    const changes = [
      ...diffElements(sourceState, targetState),
      ...diffAddedRelationships(sourceState, targetState),
    ];

    return new ChangeDelta(sourceState, targetState, changes);
  }

  get sourceState(): ProjectState {
    return this.source;
  }

  get targetState(): ProjectState {
    return this.target;
  }

  get changes(): readonly Change[] {
    return this.changeList;
  }
}

function diffElements(source: ProjectState, target: ProjectState): readonly Change[] {
  const sourceById = new Map(source.model.elements.map((element) => [element.id, element]));
  const targetIds = new Set(target.model.elements.map((element) => element.id));

  const added = target.model.elements
    .filter((element) => !sourceById.has(element.id))
    .map((element) => ({ type: ChangeType.Added, element }));

  const removed = source.model.elements
    .filter((element) => !targetIds.has(element.id))
    .map((element) => ({ type: ChangeType.Removed, element }));

  const modified = target.model.elements
    .filter((element) => {
      const before = sourceById.get(element.id);
      return before !== undefined && before.name !== element.name;
    })
    .map((element) => ({ type: ChangeType.Modified, element }));

  return [...added, ...removed, ...modified];
}

function diffAddedRelationships(
  source: ProjectState,
  target: ProjectState,
): readonly Change[] {
  const sourceIds = new Set(source.model.relationships.map((relationship) => relationship.id));

  return target.model.relationships
    .filter((relationship) => !sourceIds.has(relationship.id))
    .map((relationship) => ({ type: ChangeType.Added, relationship }));
}
