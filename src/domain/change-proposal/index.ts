import type { ProjectState } from '../project/project-state/index.js';

export enum ProposalStatus {
  Generated = 'Generated',
  UnderReview = 'UnderReview',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  Applying = 'Applying',
  Applied = 'Applied',
  ApplicationFailed = 'ApplicationFailed',
  Superseded = 'Superseded',
}

export class InvalidProposalTransitionError extends Error {
  constructor(from: ProposalStatus, to: ProposalStatus) {
    super(`Cannot transition proposal from ${from} to ${to}`);
    this.name = 'InvalidProposalTransitionError';
  }
}

export class MismatchedProjectError extends Error {
  constructor(sourceProjectId: string, targetProjectId: string) {
    super(
      `Proposal source and target states belong to different projects ` +
        `(${sourceProjectId} != ${targetProjectId})`,
    );
    this.name = 'MismatchedProjectError';
  }
}

export class ChangeProposal {
  private constructor(
    private readonly source: ProjectState,
    private readonly target: ProjectState,
    private proposalStatus: ProposalStatus,
  ) {}

  static create(sourceState: ProjectState, targetState: ProjectState): ChangeProposal {
    if (sourceState.projectId !== targetState.projectId) {
      throw new MismatchedProjectError(sourceState.projectId, targetState.projectId);
    }

    return new ChangeProposal(sourceState, targetState, ProposalStatus.Generated);
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

  review(): void {
    this.transitionTo(ProposalStatus.UnderReview, ProposalStatus.Generated);
  }

  accept(): void {
    this.transitionTo(ProposalStatus.Accepted, ProposalStatus.UnderReview);
  }

  reject(): void {
    this.transitionTo(ProposalStatus.Rejected, ProposalStatus.UnderReview);
  }

  supersede(): void {
    this.transitionTo(ProposalStatus.Superseded, ProposalStatus.UnderReview);
  }

  apply(): void {
    this.transitionTo(ProposalStatus.Applying, ProposalStatus.Accepted);
  }

  succeed(): void {
    this.transitionTo(ProposalStatus.Applied, ProposalStatus.Applying);
  }

  fail(): void {
    this.transitionTo(ProposalStatus.ApplicationFailed, ProposalStatus.Applying);
  }

  retry(): void {
    this.transitionTo(ProposalStatus.Applying, ProposalStatus.ApplicationFailed);
  }

  private transitionTo(next: ProposalStatus, allowedFrom: ProposalStatus): void {
    if (this.proposalStatus !== allowedFrom) {
      throw new InvalidProposalTransitionError(this.proposalStatus, next);
    }

    this.proposalStatus = next;
  }
}
