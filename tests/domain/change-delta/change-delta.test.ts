import { describe, expect, it } from 'vitest';

import { ChangeDelta, ChangeType } from '@/domain/change-delta/index.js';
import { ProjectState } from '@/domain/project/project-state/index.js';
import type { Element } from '@/domain/project/project-state/index.js';

describe('ChangeDelta', () => {
  it('represents the difference between two project states', () => {
    const sourceState = ProjectState.create({ elements: [], relationships: [] });
    const targetState = ProjectState.create({ elements: [], relationships: [] });

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.sourceState).toBe(sourceState);
    expect(delta.targetState).toBe(targetState);
  });

  it('contains an added element when the target state contains a new element', () => {
    const newElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectState.create({ elements: [], relationships: [] });
    const targetState = ProjectState.create({
      elements: [newElement],
      relationships: [],
    });

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Added, element: newElement }]);
  });

  it('contains a removed element when the target state no longer contains an element', () => {
    const removedElement: Element = { id: 'Order', name: 'Order' };
    const sourceState = ProjectState.create({
      elements: [removedElement],
      relationships: [],
    });
    const targetState = ProjectState.create({ elements: [], relationships: [] });

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Removed, element: removedElement }]);
  });

  it('contains a modified element when an element changes', () => {
    const before: Element = { id: 'Order', name: 'Order' };
    const after: Element = { id: 'Order', name: 'PurchaseOrder' };
    const sourceState = ProjectState.create({ elements: [before], relationships: [] });
    const targetState = ProjectState.create({ elements: [after], relationships: [] });

    const delta = ChangeDelta.between(sourceState, targetState);

    expect(delta.changes).toEqual([{ type: ChangeType.Modified, element: after }]);
  });
});
