import type { ChangeProposal } from '../change-proposal/change-proposal.js';
import { ProposalStatus } from '../change-proposal/proposal-status.js';
import { ProjectState } from './project-state/project-state.js';
import type { ProjectLocation } from './project-location.js';
import type { ProjectModel } from './project-state/project-model.js';
import { AnalysisStatus } from './analysis-status.js';
import { ProposalNotAcceptedError } from './proposal-not-accepted-error.js';
import { SourceStateMismatchError } from './source-state-mismatch-error.js';

export class Project {
  static create(initialState: ProjectState, location?: ProjectLocation): Project {
    return new Project(initialState, location);
  }

  get currentState(): ProjectState {
    return this.state;
  }

  get analysisStatus(): AnalysisStatus {
    return this.status;
  }

  get location(): ProjectLocation | undefined {
    return this.projectLocation;
  }

  private constructor(
    private state: ProjectState,
    private readonly projectLocation: ProjectLocation | undefined,
    private status: AnalysisStatus = AnalysisStatus.NotAnalyzed,
  ) {}

  startAnalysis(): void {
    this.status = AnalysisStatus.Analyzing;
  }

  completeAnalysis(model: ProjectModel, status: AnalysisStatus.Analyzed | AnalysisStatus.PartiallyAnalyzed): void {
    this.state = ProjectState.create(this.state.projectId, model);
    this.status = status;
  }

  failAnalysis(): void {
    this.status = AnalysisStatus.Failed;
  }

  cancelAnalysis(): void {
    this.status = AnalysisStatus.Cancelled;
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
