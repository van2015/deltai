import { describe, expect, it } from 'vitest';

import { ProjectState } from '@/domain/project/project-state/index.js';
import type { ProjectModel } from '@/domain/project/project-state/index.js';

describe('ProjectState', () => {
  it('creates a state from a project model', () => {
    const model: ProjectModel = { elements: [], relationships: [] };

    const state = ProjectState.create(model);

    expect(state.model).toBe(model);
  });
});
