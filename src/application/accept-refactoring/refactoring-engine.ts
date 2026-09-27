import type { ProjectState } from '../../domain/project/project-state/project-state.js';
import type { RefactoringProposal } from '../../domain/refactoring-analyzer/refactoring-proposal.js';

export interface RefactoringEngine {
  transform(
    sourceState: ProjectState,
    proposal: RefactoringProposal,
  ): Promise<ProjectState>;
}
