import { ProposalStatus, type ChangeProposal } from '../change-proposal/index.js';
import type { ProjectState } from './project-state/index.js';

export class SourceStateMismatchError extends Error {
  constructor() {
    super('Proposal source state does not match the current project state');
    this.name = 'SourceStateMismatchError';
  }
}

export class ProposalNotAcceptedError extends Error {
  constructor(status: ProposalStatus) {
    super(`Cannot apply a proposal in ${status} state`);
    this.name = 'ProposalNotAcceptedError';
  }
}

export class Project {
  private constructor(private state: ProjectState) {}

  static create(initialState: ProjectState): Project {
    return new Project(initialState);
  }

  get currentState(): ProjectState {
    return this.state;
  }

  apply(proposal: ChangeProposal): void {
    if (proposal.sourceState !== this.state) {
      throw new SourceStateMismatchError();
    }

    if (proposal.status !== ProposalStatus.Accepted) {
      throw new ProposalNotAcceptedError(proposal.status);
    }

    this.state = proposal.targetState;
  }
}
