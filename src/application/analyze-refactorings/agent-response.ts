import type { RefactoringProposal } from '../../domain/refactoring-analyzer/refactoring-proposal.js';

export interface AgentResponse {
  readonly proposals: readonly RefactoringProposal[];
}
