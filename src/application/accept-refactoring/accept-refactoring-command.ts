import type { ProjectId } from '../../domain/project/project-state/project-id.js';
import type { RefactoringProposal } from '../../domain/refactoring-analyzer/refactoring-proposal.js';

export class AcceptRefactoringCommand {
  constructor(
    readonly projectId: ProjectId,
    readonly proposal: RefactoringProposal,
  ) {}
}
