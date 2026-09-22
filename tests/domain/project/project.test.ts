import { describe, expect, it } from 'vitest';

import { ChangeProposal } from '@/domain/change-proposal/index.js';
import { Project, SourceStateMismatchError } from '@/domain/project/index.js';
import { ProjectState } from '@/domain/project/project-state/index.js';

describe('Project', () => {
  it('starts with an initial state', () => {
    const initialState = ProjectState.create({ elements: [], relationships: [] });

    const project = Project.create(initialState);

    expect(project.currentState).toBe(initialState);
  });
});

describe('Project.apply', () => {
  it('moves the project to the proposal target state', () => {
    const state0 = ProjectState.create({ elements: [], relationships: [] });
    const state1 = ProjectState.create({ elements: [], relationships: [] });
    const proposal = ChangeProposal.create(state0, state1);
    const project = Project.create(state0);

    project.apply(proposal);

    expect(project.currentState).toBe(state1);
  });

  it('rejects a proposal whose source state is not the current state', () => {
    const state0 = ProjectState.create({ elements: [], relationships: [] });
    const state1 = ProjectState.create({ elements: [], relationships: [] });
    const state2 = ProjectState.create({ elements: [], relationships: [] });
    const proposal = ChangeProposal.create(state0, state1);
    const project = Project.create(state2);

    expect(() => project.apply(proposal)).toThrow(SourceStateMismatchError);
    expect(project.currentState).toBe(state2);
  });
});
