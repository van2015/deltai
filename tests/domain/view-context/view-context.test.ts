import { describe, expect, it } from 'vitest';

import { ViewContext } from '@/domain/view-context/view-context.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

describe('ViewContext', () => {
  it('can be created empty', () => {
    const context = ViewContext.create();

    expect(context.projectState).toBeUndefined();
    expect(context.isSubmitted).toBe(false);
  });

  it('can be associated with a project state', () => {
    const projectState = ProjectStateBuilder.aState().build();

    const context = ViewContext.create(projectState);

    expect(context.projectState).toBe(projectState);
  });

  it('preserves the project state it was created with', () => {
    const projectState = ProjectStateBuilder.aState().build();

    const context = ViewContext.create(projectState);

    expect(context.projectState).toBe(projectState);
  });

  it('does not modify the project state when created', () => {
    const projectState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const expectedState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();

    ViewContext.create(projectState);

    expect(projectState.hasSameModelAs(expectedState)).toBe(true);
  });

  it('has its own identity', () => {
    const firstContext = ViewContext.create();
    const secondContext = ViewContext.create();

    expect(firstContext.id).not.toBe(secondContext.id);
  });

  it('is immutable after being submitted', () => {
    const projectState = ProjectStateBuilder.aState().build();
    const replacementState = ProjectStateBuilder.aState().build();
    const context = ViewContext.create(projectState);

    context.submit();

    expect(context.isSubmitted).toBe(true);
    expect(Object.isFrozen(context)).toBe(true);
    expect(() => {
      (context as unknown as { projectState: typeof replacementState }).projectState =
        replacementState;
    }).toThrow();
    expect(context.projectState).toBe(projectState);
  });
});
