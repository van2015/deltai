import type { ProjectState } from '@/domain/project/project-state/project-state.js';
import type { RefactoringProposal } from '@/domain/refactoring-analyzer/refactoring-proposal.js';
import type { RefactoringEngine } from '@/application/accept-refactoring/refactoring-engine.js';

export class FakeRefactoringEngine implements RefactoringEngine {
  sourceState: ProjectState | undefined;
  proposal: RefactoringProposal | undefined;

  constructor(private readonly targetState: ProjectState) {}

  async transform(
    sourceState: ProjectState,
    proposal: RefactoringProposal,
  ): Promise<ProjectState> {
    this.sourceState = sourceState;
    this.proposal = proposal;

    return this.targetState;
  }
}
