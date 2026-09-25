import { describe, expect, it } from 'vitest';

import type { Element } from '@/domain/project/project-state/element.js';
import type { ProjectModel } from '@/domain/project/project-state/project-model.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

describe('ProjectState', () => {
  it('creates a state from a project model', () => {
    const model: ProjectModel = {
      elements: [{ id: 'Order', name: 'Order' }],
      relationships: [{ id: 'Order->Customer', name: 'depends' }],
    };

    const state = ProjectStateBuilder.aState().withModel(model).build();

    expect(state.getElements()).toEqual(model.elements);
    expect(state.getRelationships()).toEqual(model.relationships);
  });

  it('gives independently created states different ids', () => {
    const firstState = ProjectStateBuilder.aState().build();
    const secondState = ProjectStateBuilder.aState().build();

    expect(firstState.id).not.toBe(secondState.id);
  });

  it('belongs to the project it was created with', () => {
    const state = ProjectStateBuilder.aState().withProjectId('project-a').build();

    expect(state.projectId).toBe('project-a');
  });

  it('can hold a model semantically identical to another state', () => {
    const firstState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const secondState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const differentState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'PurchaseOrder' })
      .build();

    expect(firstState.hasSameModelAs(secondState)).toBe(true);
    expect(firstState.hasSameModelAs(differentState)).toBe(false);
    expect(firstState.id).not.toBe(secondState.id);
  });

  it('does not expose its model for mutation', () => {
    const state = ProjectStateBuilder.aState().build();
    const elements = state.getElements() as Element[];

    elements.push({ id: 'Customer', name: 'Customer' });

    const expected = ProjectStateBuilder.aState().build();

    expect(state.hasSameModelAs(expected)).toBe(true);
  });
});
