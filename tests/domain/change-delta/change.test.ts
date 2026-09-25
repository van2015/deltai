import { describe, expect, it } from 'vitest';

import { Change } from '@/domain/change-delta/change.js';
import { ChangeType } from '@/domain/change-delta/change-type.js';

describe('Change', () => {
  it('is immutable', () => {
    const change = Change.forElement(ChangeType.Added, {
      id: 'Order',
      name: 'Order',
    });

    expect(Object.isFrozen(change)).toBe(true);
    expect(Object.isFrozen(change.element)).toBe(true);
    expect(() => {
      (change as unknown as { type: ChangeType }).type = ChangeType.Removed;
    }).toThrow();
  });

  it('considers changes with the same data equivalent', () => {
    const firstChange = Change.forElement(ChangeType.Modified, {
      id: 'Order',
      name: 'Order',
    });
    const secondChange = Change.forElement(ChangeType.Modified, {
      id: 'Order',
      name: 'Order',
    });

    expect(firstChange.isEquivalentTo(secondChange)).toBe(true);
  });
});
