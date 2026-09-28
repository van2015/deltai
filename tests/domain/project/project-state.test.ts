import { describe, expect, it } from 'vitest';

import type { Element } from '@/domain/project/project-state/element.js';
import type { ProjectModel } from '@/domain/project/project-state/project-model.js';
import { DuplicateProjectModelIdError } from '@/domain/project/project-state/duplicate-project-model-id-error.js';

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

  it('takes a defensive snapshot of the model at creation time', () => {
    const mutableModel = {
      elements: [{ id: 'Order', name: 'Order' }],
      relationships: [{ id: 'Order->Customer', name: 'depends' }],
    };
    const model: ProjectModel = mutableModel;

    const state = ProjectStateBuilder.aState().withModel(model).build();
    mutableModel.elements[0]!.name = 'PurchaseOrder';
    mutableModel.relationships[0]!.name = 'owns';
    mutableModel.elements.push({ id: 'Customer', name: 'Customer' });

    expect(state.getElements()).toEqual([{ id: 'Order', name: 'Order' }]);
    expect(state.getRelationships()).toEqual([
      { id: 'Order->Customer', name: 'depends' },
    ]);
  });

  it('rejects duplicate element ids', () => {
    expect(() =>
      ProjectStateBuilder.aState()
        .withElement({ id: 'Order', name: 'Order' })
        .withElement({ id: 'Order', name: 'PurchaseOrder' })
        .build(),
    ).toThrow(DuplicateProjectModelIdError);
  });

  it('rejects duplicate relationship ids', () => {
    expect(() =>
      ProjectStateBuilder.aState()
        .withRelationship({ id: 'Order->Customer', name: 'depends' })
        .withRelationship({ id: 'Order->Customer', name: 'owns' })
        .build(),
    ).toThrow(DuplicateProjectModelIdError);
  });

  it('compares model equivalence independently of project identity', () => {
    const firstState = ProjectStateBuilder.aState()
      .withProjectId('project-a')
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const secondState = ProjectStateBuilder.aState()
      .withProjectId('project-b')
      .withElement({ id: 'Order', name: 'Order' })
      .build();

    expect(firstState.hasSameModelAs(secondState)).toBe(true);
  });
});
