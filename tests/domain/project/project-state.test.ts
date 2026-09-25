import { describe, expect, it } from 'vitest';

import type { ProjectModel } from '@/domain/project/project-state/index.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

describe('ProjectState', () => {
  it('creates a state from a project model', () => {
    const model: ProjectModel = { elements: [], relationships: [] };

    const state = ProjectStateBuilder.aState().withModel(model).build();

    expect(state.model).toBe(model);
  });

  it('gives independently created states different ids', () => {
    const firstState = ProjectStateBuilder.aState().build();
    const secondState = ProjectStateBuilder.aState().build();

    expect(firstState.id).not.toBe(secondState.id);
  });

  it('cannot have its model replaced', () => {
    const model: ProjectModel = { elements: [], relationships: [] };
    const replacement: ProjectModel = { elements: [], relationships: [] };
    const state = ProjectStateBuilder.aState().withModel(model).build();

    expect(() => {
      (state as unknown as { model: ProjectModel }).model = replacement;
    }).toThrow();

    expect(state.model).toBe(model);
  });
});
