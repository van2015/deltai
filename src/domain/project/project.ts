import type { ChangeProposal } from '../change-proposal/change-proposal.js';
import { ProposalStatus } from '../change-proposal/proposal-status.js';
import type { ProjectState } from './project-state/project-state.js';
import { ProposalNotAcceptedError } from './proposal-not-accepted-error.js';
import { SourceStateMismatchError } from './source-state-mismatch-error.js';

export class Project {
  private constructor(private state: ProjectState) {}

  static create(initialState: ProjectState): Project {
    return new Project(initialState);
  }

  get currentState(): ProjectState {
    return this.state;
  }

  apply(
    proposal: ChangeProposal,
    applyToWorkspace: (targetState: ProjectState) => void = () => {},
  ): void {
    if (proposal.isStaleFor(this)) {
      throw new SourceStateMismatchError();
    }

    if (proposal.status !== ProposalStatus.Accepted) {
      throw new ProposalNotAcceptedError(proposal.status);
    }

    proposal.apply();

    try {
      applyToWorkspace(proposal.targetState);
      this.state = proposal.targetState;
      proposal.succeed();
    } catch (error) {
      proposal.fail();
      throw error;
    }
  }
}
