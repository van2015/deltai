import type { ChangeProposal } from '../change-proposal/change-proposal.js';
import { ProposalStatus } from '../change-proposal/proposal-status.js';
import type { ProjectState } from './project-state/project-state.js';
import type { ProjectLocation } from './project-location.js';
import { ProposalNotAcceptedError } from './proposal-not-accepted-error.js';
import { SourceStateMismatchError } from './source-state-mismatch-error.js';

export class Project {
  static create(initialState: ProjectState, location?: ProjectLocation): Project {
    return new Project(initialState, location);
  }

  get currentState(): ProjectState {
    return this.state;
  }

  get location(): ProjectLocation | undefined {
    return this.projectLocation;
  }

  private constructor(
    private state: ProjectState,
    private readonly projectLocation: ProjectLocation | undefined,
  ) {}

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
