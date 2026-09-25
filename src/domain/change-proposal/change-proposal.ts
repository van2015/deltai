import type { ProjectState } from '../project/project-state/project-state.js';
import type { Project } from '../project/project.js';
import { InvalidProposalTransitionError } from './invalid-proposal-transition-error.js';
import { MissingSourceStateError } from './missing-source-state-error.js';
import { MissingTargetStateError } from './missing-target-state-error.js';
import { MismatchedProjectError } from './mismatched-project-error.js';
import { ProposalStatus } from './proposal-status.js';

export class ChangeProposal {
  private constructor(
    private readonly source: ProjectState,
    private readonly target: ProjectState,
    private proposalStatus: ProposalStatus,
  ) {}

  static create(sourceState: ProjectState, targetState: ProjectState): ChangeProposal {
    if (sourceState === undefined) {
      throw new MissingSourceStateError();
    }

    if (targetState === undefined) {
      throw new MissingTargetStateError();
    }

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

  hasNoChanges(): boolean {
    return this.source === this.target || this.source.hasSameModelAs(this.target);
  }

  isStaleFor(project: Project): boolean {
    return this.sourceState !== project.currentState;
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

  abandon(): void {
    this.transitionTo(ProposalStatus.Rejected, ProposalStatus.ApplicationFailed);
  }

  private transitionTo(next: ProposalStatus, allowedFrom: ProposalStatus): void {
    if (this.proposalStatus !== allowedFrom) {
      throw new InvalidProposalTransitionError(this.proposalStatus, next);
    }

    this.proposalStatus = next;
  }
}
