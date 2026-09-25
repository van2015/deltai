import type { ProjectState } from '../project/project-state/project-state.js';
import type { ChangeProposal } from '../change-proposal/change-proposal.js';
import { Change } from './change.js';
import { ChangeType } from './change-type.js';

export class ChangeDelta {
  private constructor(
    private readonly source: ProjectState,
    private readonly target: ProjectState,
    private readonly changeList: readonly Change[],
  ) {}

  static between(sourceState: ProjectState, targetState: ProjectState): ChangeDelta {
    const changes = [
      ...ChangeDelta.diffElements(sourceState, targetState),
      ...ChangeDelta.diffRelationships(sourceState, targetState),
    ];

    return new ChangeDelta(sourceState, targetState, changes);
  }

  static from(proposal: ChangeProposal): ChangeDelta {
    return ChangeDelta.between(proposal.sourceState, proposal.targetState);
  }

  get sourceState(): ProjectState {
    return this.source;
  }

  get targetState(): ProjectState {
    return this.target;
  }

  get changes(): readonly Change[] {
    return [...this.changeList];
  }

  isEquivalentTo(otherDelta: ChangeDelta): boolean {
    return (
      this.sourceState.id === otherDelta.sourceState.id &&
      this.targetState.id === otherDelta.targetState.id &&
      ChangeDelta.sameChanges(this.changeList, otherDelta.changeList)
    );
  }

  private static diffElements(source: ProjectState, target: ProjectState): readonly Change[] {
    const sourceElements = source.getElements();
    const targetElements = target.getElements();

    const sourceById = new Map(sourceElements.map((element) => [element.id, element]));
    const targetIds = new Set(targetElements.map((element) => element.id));

    const added = targetElements
      .filter((element) => !sourceById.has(element.id))
      .map((element) => Change.forElement(ChangeType.Added, element));

    const removed = sourceElements
      .filter((element) => !targetIds.has(element.id))
      .map((element) => Change.forElement(ChangeType.Removed, element));

    const modified = targetElements
      .filter((element) => {
        const before = sourceById.get(element.id);
        return before !== undefined && before.name !== element.name;
      })
      .map((element) => Change.forElement(ChangeType.Modified, element));

    return [...added, ...removed, ...modified];
  }

  private static diffRelationships(
    source: ProjectState,
    target: ProjectState,
  ): readonly Change[] {
    const sourceRelationships = source.getRelationships();
    const targetRelationships = target.getRelationships();
    const sourceById = new Map(
      sourceRelationships.map((relationship) => [relationship.id, relationship]),
    );
    const targetIds = new Set(targetRelationships.map((relationship) => relationship.id));

    const added = targetRelationships
      .filter((relationship) => !sourceById.has(relationship.id))
      .map((relationship) => Change.forRelationship(ChangeType.Added, relationship));

    const removed = sourceRelationships
      .filter((relationship) => !targetIds.has(relationship.id))
      .map((relationship) => Change.forRelationship(ChangeType.Removed, relationship));

    const modified = targetRelationships
      .filter((relationship) => {
        const before = sourceById.get(relationship.id);
        return before !== undefined && before.name !== relationship.name;
      })
      .map((relationship) => Change.forRelationship(ChangeType.Modified, relationship));

    return [...added, ...removed, ...modified];
  }

  private static sameChanges(left: readonly Change[], right: readonly Change[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    const unmatched = [...right];

    for (const change of left) {
      const matchIndex = unmatched.findIndex((candidate) =>
        change.isEquivalentTo(candidate),
      );

      if (matchIndex === -1) {
        return false;
      }

      unmatched.splice(matchIndex, 1);
    }

    return unmatched.length === 0;
  }
}
