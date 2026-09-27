import { describe, expect, it } from 'vitest';

import { ApplyChangeProposalCommand } from '@/application/apply-change-proposal/apply-change-proposal-command.js';
import { ApplyChangeProposal } from '@/application/apply-change-proposal/apply-change-proposal.js';
import { ChangeProposal } from '@/domain/change-proposal/change-proposal.js';
import { ProposalStatus } from '@/domain/change-proposal/proposal-status.js';
import { Project } from '@/domain/project/project.js';
import { ProposalNotAcceptedError } from '@/domain/project/proposal-not-accepted-error.js';

import { ProjectStateBuilder } from '../support/builders/project-state.builder.js';
import { FakeProjectRepository } from '../support/fakes/fake-project-repository.js';
import { FakeWorkspaceWriter } from '../support/fakes/fake-workspace-writer.js';

const createAcceptedProposal = () => {
  const sourceState = ProjectStateBuilder.aState().build();
  const targetState = ProjectStateBuilder.aState()
    .withElement({ id: 'Order', name: 'Order' })
    .build();
  const proposal = ChangeProposal.create(sourceState, targetState);
  proposal.review();
  proposal.accept();

  return { sourceState, targetState, proposal };
};

describe('ApplyChangeProposal', () => {
  it('applies an accepted proposal to the project and workspace', async () => {
    const { sourceState, targetState, proposal } = createAcceptedProposal();
    const project = Project.create(sourceState);
    const workspace = new FakeWorkspaceWriter();
    const application = new ApplyChangeProposal(
      new FakeProjectRepository(project),
      workspace,
    );

    const appliedProposal = await application.execute(
      new ApplyChangeProposalCommand('project-1', proposal),
    );

    expect(appliedProposal).toBe(proposal);
    expect(project.currentState).toBe(targetState);
    expect(workspace.appliedState).toBe(targetState);
    expect(proposal.status).toBe(ProposalStatus.Applied);
  });

  it('does not modify the project when the proposal is not accepted', async () => {
    const sourceState = ProjectStateBuilder.aState().build();
    const targetState = ProjectStateBuilder.aState()
      .withElement({ id: 'Order', name: 'Order' })
      .build();
    const proposal = ChangeProposal.create(sourceState, targetState);
    const project = Project.create(sourceState);
    const workspace = new FakeWorkspaceWriter();
    const application = new ApplyChangeProposal(
      new FakeProjectRepository(project),
      workspace,
    );

    await expect(
      application.execute(new ApplyChangeProposalCommand('project-1', proposal)),
    ).rejects.toThrow(ProposalNotAcceptedError);

    expect(project.currentState).toBe(sourceState);
    expect(workspace.appliedState).toBeUndefined();
  });

  it('preserves the project when workspace application fails', async () => {
    const { sourceState, proposal } = createAcceptedProposal();
    const project = Project.create(sourceState);
    const workspace = new FakeWorkspaceWriter();
    workspace.shouldFail = true;
    const application = new ApplyChangeProposal(
      new FakeProjectRepository(project),
      workspace,
    );

    await expect(
      application.execute(new ApplyChangeProposalCommand('project-1', proposal)),
    ).rejects.toThrow('workspace application failed');

    expect(project.currentState).toBe(sourceState);
    expect(proposal.status).toBe(ProposalStatus.ApplicationFailed);
  });
});
