import { describe, expect, it } from 'vitest';

import { ChangeDelta, ChangeType } from '@/domain/change-delta/index.js';
import type { Element, Relationship } from '@/domain/project/project-state/index.js';

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
  });

  it('contains a removed element when the target state no longer contains an element', () => {
    const removedElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectStateBuilder.aState().withElement(removedElement).build();
    const targetState = ProjectStateBuilder.aState().build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Removed, element: removedElement }]);
  });

  it('contains a modified element when an element changes', () => {
    const before: Element = { id: 'Order', name: 'Order' };
    const after: Element = { id: 'Order', name: 'PurchaseOrder' };
    const sourceState = ProjectStateBuilder.aState().withElement(before).build();
    const targetState = ProjectStateBuilder.aState().withElement(after).build();

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Modified, element: after }]);
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
});
