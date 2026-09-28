import { describe, expect, it } from 'vitest';

import { ChangeProposal } from '@/domain/change-proposal/change-proposal.js';
import { Change } from '@/domain/change-delta/change.js';
import { ChangeDelta } from '@/domain/change-delta/change-delta.js';
import { ChangeType } from '@/domain/change-delta/change-type.js';
import { InvalidChangeApplicationError } from '@/domain/change-delta/invalid-change-application-error.js';
import type { Element } from '@/domain/project/project-state/element.js';
import type { Relationship } from '@/domain/project/project-state/relationship.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

describe('ChangeDelta', () => {
  it('represents the difference between two project states', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.sourceState).toBe(sourceState);
    expect(delta.targetState).toBe(targetState);
  });

  it('produces an empty delta when diffing a state with itself', () => {
    const state = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();

    const delta = ChangeDelta.between(state, state);

    expect(delta.changes).toEqual([]);
  });

  it('contains an added element when the target state contains a new element', () => {
    const newElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState().withElement(newElement).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([Change.forElement(ChangeType.Added, newElement)]);
    expect(delta.changes[0]?.element?.id).toBe(newElement.id);
  });

  it('contains a removed element when the target state no longer contains an element', () => {
    const removedElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(removedElement).build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([Change.forElement(ChangeType.Removed, removedElement)]);
    expect(delta.changes[0]?.element?.id).toBe(removedElement.id);
  });

  it('contains a modified element when an element changes', () => {
    const before: Element = { id: 'Order', name: 'Order' };
    const after: Element = { id: 'Order', name: 'PurchaseOrder' };
    const sourceState = ProjectStateBuilder.aState().withElement(before).build();
    const targetState = ProjectStateBuilder.aState().withElement(after).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([Change.forElement(ChangeType.Modified, after)]);
    expect(delta.changes[0]?.isEquivalentTo(Change.forElement(ChangeType.Added, after))).toBe(
      false,
    );
    expect(
      delta.changes[0]?.isEquivalentTo(Change.forElement(ChangeType.Removed, before)),
    ).toBe(false);
  });

  it('contains an added relationship when the target state contains a new relationship', () => {
    const newRelationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withRelationship(newRelationship)
      .build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      Change.forRelationship(ChangeType.Added, newRelationship),
    ]);
  });

  it('is empty when the states are equivalent', () => {
    const element: Element = { id: 'Order', name: 'Order' };
    const relationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState()
      .withElement(element)
      .withRelationship(relationship)
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement(element)
      .withRelationship(relationship)
      .build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([]);
  });

  it('does not mark an unchanged element as modified', () => {
    const element: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(element).build();
    const targetState = ProjectStateBuilder.aState().withElement(element).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(
      delta.changes.some((change) =>
        change.isEquivalentTo(Change.forElement(ChangeType.Modified, element)),
      ),
    ).toBe(false);
  });

  it('contains a removed relationship when the target state no longer contains a relationship', () => {
    const relationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState()
      .withRelationship(relationship)
      .build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      Change.forRelationship(ChangeType.Removed, relationship),
    ]);
  });

  it('contains a modified relationship when a relationship changes', () => {
    const before: Relationship = { id: 'Order->Customer', name: 'depends' };
    const after: Relationship = { id: 'Order->Customer', name: 'owns' };
    const sourceState = ProjectStateBuilder.aState().withRelationship(before).build();
    const targetState = ProjectStateBuilder.aState().withRelationship(after).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      Change.forRelationship(ChangeType.Modified, after),
    ]);
  });

  it('does not modify either state', () => {
    const element: Element = { id: 'Order', name: 'Order' };
    const relationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState()
      .withElement(element)
      .withRelationship(relationship)
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'PurchaseOrder', name: 'PurchaseOrder' })
      .withRelationship({ id: 'Order->Customer', name: 'owns' })
      .build();
    const sourceBefore = ProjectStateBuilder.aState()
      .withElement(element)
      .withRelationship(relationship)
      .build();
    const targetBefore = ProjectStateBuilder.aState()
      .withElement({ id: 'PurchaseOrder', name: 'PurchaseOrder' })
      .withRelationship({ id: 'Order->Customer', name: 'owns' })
      .build();

    ChangeDelta.between(sourceState, targetState);

    expect(sourceState.hasSameModelAs(sourceBefore)).toBe(true);
    expect(targetState.hasSameModelAs(targetBefore)).toBe(true);
  });

  it('can reconstruct the target state by applying its changes to the source', () => {
    const sourceState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .withRelationship({ id: 'Order->Customer', name: 'depends' })
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'PurchaseOrder' })
      .withElement({ id: 'Customer', name: 'Customer' })
      .withRelationship({ id: 'Order->Customer', name: 'owns' })
      .build();
    const delta = ChangeDelta.between(sourceState, targetState);

    const reconstructedState = delta.applyTo(sourceState);

    expect(reconstructedState.hasSameModelAs(targetState)).toBe(true);
  });

  it('can apply a delta to an equivalent source snapshot', () => {
    const sourceState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const equivalentSource = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'PurchaseOrder' })
      .build();
    const delta = ChangeDelta.between(sourceState, targetState);

    const reconstructedState = delta.applyTo(equivalentSource);

    expect(reconstructedState.hasSameModelAs(targetState)).toBe(true);
  });

  it('rejects applying a delta to a different project', () => {
    const sourceState = ProjectStateBuilder.aState()
      .withProjectId('project-a')
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withProjectId('project-a')
      .withElement({ id: 'Order', name: 'PurchaseOrder' })
      .build();
    const otherProjectState = ProjectStateBuilder.aState()
      .withProjectId('project-b')
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const delta = ChangeDelta.between(sourceState, targetState);

    expect(() => delta.applyTo(otherProjectState)).toThrow(InvalidChangeApplicationError);
  });

  it('rejects applying a delta to a different model', () => {
    const sourceState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'PurchaseOrder' })
      .build();
    const differentSource = ProjectStateBuilder.aState()
      .withElement({ id: 'Customer', name: 'Customer' })
      .build();
    const delta = ChangeDelta.between(sourceState, targetState);

    expect(() => delta.applyTo(differentSource)).toThrow(InvalidChangeApplicationError);
  });

  it('contains only elements and relationships from the compared states', () => {
    const sourceElement: Element = { id: 'Order', name: 'Order' };
    const targetRelationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState().withElement(sourceElement).build();
    const targetState = ProjectStateBuilder.aState()
      .withRelationship(targetRelationship)
      .build();
    const delta = ChangeDelta.between(sourceState, targetState);
    const knownIds = new Set([
      sourceElement.id,
      targetRelationship.id,
    ]);

    for (const change of delta.changes) {
      const changedId = change.element?.id ?? change.relationship?.id;
      expect(changedId !== undefined && knownIds.has(changedId)).toBe(true);
    }
  });

  it('treats different elements with identical content as separate elements', () => {
    const sourceElement: Element = { id: 'order', name: 'Order' };
    const targetElement: Element = { id: 'purchase-order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(sourceElement).build();
    const targetState = ProjectStateBuilder.aState().withElement(targetElement).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      Change.forElement(ChangeType.Added, targetElement),
      Change.forElement(ChangeType.Removed, sourceElement),
    ]);
  });

  it('is equivalent to another delta with the same states and changes', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const firstDelta = ChangeDelta.between(sourceState, targetState);
    const secondDelta = ChangeDelta.between(sourceState, targetState);

    expect(firstDelta.isEquivalentTo(secondDelta)).toBe(true);
  });

  it('is not equivalent to a delta with different changes', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const differentTargetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Customer', name: 'Customer' })
      .build();
    const firstDelta = ChangeDelta.between(sourceState, targetState);
    const secondDelta = ChangeDelta.between(sourceState, differentTargetState);

    expect(firstDelta.isEquivalentTo(secondDelta)).toBe(false);
  });

  it('can be created from a change proposal source and target', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const proposal = ChangeProposal.create(sourceState, targetState);

    const delta = ChangeDelta.from(proposal);

    expect(delta.sourceState).toBe(sourceState);
    expect(delta.targetState).toBe(targetState);
  });

  it('produces equivalent deltas when queried twice for the same proposal', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const proposal = ChangeProposal.create(sourceState, targetState);

    const firstDelta = ChangeDelta.from(proposal);
    const secondDelta = ChangeDelta.from(proposal);

    expect(firstDelta.isEquivalentTo(secondDelta)).toBe(true);
  });

  it('does not modify the proposal when its representation is changed', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const proposal = ChangeProposal.create(sourceState, targetState);
    const delta = ChangeDelta.from(proposal);
    const changes = delta.changes as Change[];

    changes.push(
      Change.forElement(ChangeType.Added, { id: 'Customer', name: 'Customer' }),
    );

    const rebuiltDelta = ChangeDelta.from(proposal);

    expect(rebuiltDelta.isEquivalentTo(delta)).toBe(true);
    expect(proposal.sourceState).toBe(sourceState);
    expect(proposal.targetState).toBe(targetState);
  });

  it('produces a different delta for a proposal with a different target state', () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const firstTarget = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const secondTarget = ProjectStateBuilder.aState()
      .withElement({ id: 'Customer', name: 'Customer' })
      .build();
    const firstProposal = ChangeProposal.create(sourceState, firstTarget);
    const secondProposal = ChangeProposal.create(sourceState, secondTarget);

    const firstDelta = ChangeDelta.from(firstProposal);
    const secondDelta = ChangeDelta.from(secondProposal);

    expect(firstDelta.isEquivalentTo(secondDelta)).toBe(false);
  });
});
