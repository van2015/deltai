import type { ProjectState } from '../project/project-state/index.js';

export type ProposalStatus = 'Generated';

export class ChangeProposal {
  private constructor(
    private readonly source: ProjectState,
    private readonly target: ProjectState,
    private proposalStatus: ProposalStatus,
  ) {}

  static create(sourceState: ProjectState, targetState: ProjectState): ChangeProposal {
    return new ChangeProposal(sourceState, targetState, 'Generated');
  }

  get sourceState(): ProjectState {
    return this.source;
  }

  get targetState(): ProjectState {
    return this.target;
  }

  get status(): ProposalStatus {
    return this.proposalStatus;
  }
}
