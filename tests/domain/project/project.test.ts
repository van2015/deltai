import { describe, expect, it } from 'vitest';

import { ChangeProposal } from '@/domain/change-proposal/change-proposal.js';
import { Project } from '@/domain/project/project.js';
import { ProposalNotAcceptedError } from '@/domain/project/proposal-not-accepted-error.js';
import { SourceStateMismatchError } from '@/domain/project/source-state-mismatch-error.js';

import { ProjectStateBuilder } from '../../support/builders/project-state.builder.js';

describe('Project', () => {
  it('starts with an initial state', () => {
    const initialState = ProjectStateBuilder.aState().build();

    const project = Project.create(initialState);

    expect(project.currentState).toBe(initialState);
  });
});

describe('Project.apply', () => {
  it('moves the project to the proposal target state', () => {
    const state0 = ProjectStateBuilder.aState().build();
    const state1 = ProjectStateBuilder.aState().build();
    const proposal = ChangeProposal.create(state0, state1);
    proposal.review();
    proposal.accept();
    const project = Project.create(state0);

    project.apply(proposal);

    expect(project.currentState).toBe(state1);
  });

  it('cannot apply a proposal that is not accepted', () => {
    const state0 = ProjectStateBuilder.aState().build();
    const state1 = ProjectStateBuilder.aState().build();
    const proposal = ChangeProposal.create(state0, state1);
    const project = Project.create(state0);

    expect(() => project.apply(proposal)).toThrow(ProposalNotAcceptedError);
    expect(project.currentState).toBe(state0);
  });

  it('cannot apply a proposal that is still under review', () => {
    const state0 = ProjectStateBuilder.aState().build();
    const state1 = ProjectStateBuilder.aState().build();
    const proposal = ChangeProposal.create(state0, state1);
    proposal.review();
    const project = Project.create(state0);

    expect(() => project.apply(proposal)).toThrow(ProposalNotAcceptedError);
    expect(project.currentState).toBe(state0);
  });

  it('rejects a proposal whose source state is not the current state', () => {
    const state0 = ProjectStateBuilder.aState().build();
    const state1 = ProjectStateBuilder.aState().build();
    const state2 = ProjectStateBuilder.aState().build();
    const proposal = ChangeProposal.create(state0, state1);
    const project = Project.create(state2);

    expect(() => project.apply(proposal)).toThrow(SourceStateMismatchError);
    expect(project.currentState).toBe(state2);
  });
});
