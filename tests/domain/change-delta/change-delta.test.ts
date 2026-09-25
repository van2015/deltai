import { describe, expect, it } from 'vitest';

import { ChangeDelta } from '@/domain/change-delta/change-delta.js';
import { ChangeType } from '@/domain/change-delta/change-type.js';
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

  it('contains an added element when the target state contains a new element', () => {
    const newElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState().withElement(newElement).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Added, element: newElement }]);
    expect(delta.changes).toContainEqual({
      type: ChangeType.Added,
      element: expect.objectContaining({ id: newElement.id }),
    });
  });

  it('contains a removed element when the target state no longer contains an element', () => {
    const removedElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(removedElement).build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Removed, element: removedElement }]);
    expect(delta.changes).toContainEqual({
      type: ChangeType.Removed,
      element: expect.objectContaining({ id: removedElement.id }),
    });
  });

  it('contains a modified element when an element changes', () => {
    const before: Element = { id: 'Order', name: 'Order' };
    const after: Element = { id: 'Order', name: 'PurchaseOrder' };
    const sourceState = ProjectStateBuilder.aState().withElement(before).build();
    const targetState = ProjectStateBuilder.aState().withElement(after).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Modified, element: after }]);
    expect(delta.changes).not.toContainEqual({
      type: ChangeType.Added,
      element: after,
    });
    expect(delta.changes).not.toContainEqual({
      type: ChangeType.Removed,
      element: before,
    });
  });

  it('contains an added relationship when the target state contains a new relationship', () => {
    const newRelationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withRelationship(newRelationship)
      .build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      { type: ChangeType.Added, relationship: newRelationship },
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

    expect(delta.changes).not.toContainEqual({
      type: ChangeType.Modified,
      element,
    });
  });

  it('contains a removed relationship when the target state no longer contains a relationship', () => {
    const relationship: Relationship = { id: 'Order->Customer', name: 'depends' };
    const sourceState = ProjectStateBuilder.aState()
      .withRelationship(relationship)
      .build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Removed, relationship }]);
  });

  it('contains a modified relationship when a relationship changes', () => {
    const before: Relationship = { id: 'Order->Customer', name: 'depends' };
    const after: Relationship = { id: 'Order->Customer', name: 'owns' };
    const sourceState = ProjectStateBuilder.aState().withRelationship(before).build();
    const targetState = ProjectStateBuilder.aState().withRelationship(after).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Modified, relationship: after }]);
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

  it('treats different elements with identical content as separate elements', () => {
    const sourceElement: Element = { id: 'order', name: 'Order' };
    const targetElement: Element = { id: 'purchase-order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(sourceElement).build();
    const targetState = ProjectStateBuilder.aState().withElement(targetElement).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([
      { type: ChangeType.Added, element: targetElement },
      { type: ChangeType.Removed, element: sourceElement },
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
});
