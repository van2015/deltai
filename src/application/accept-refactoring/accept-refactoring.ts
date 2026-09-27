import { ChangeProposal } from '../../domain/change-proposal/change-proposal.js';
import type { RefactoringProposal } from '../../domain/refactoring-analyzer/refactoring-proposal.js';
import type { AcceptRefactoringCommand } from './accept-refactoring-command.js';
import type { RefactoringEngine } from './refactoring-engine.js';
import type { ProjectRepository } from '../analyze-refactorings/project-repository.js';

export class AcceptRefactoring {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly refactoringEngine: RefactoringEngine,
  ) {}

  async execute(command: AcceptRefactoringCommand): Promise<ChangeProposal> {
    const project = await this.projectRepository.get(command.projectId);
    const sourceState = project.currentState;
    const targetState = await this.refactoringEngine.transform(
      sourceState,
      command.proposal,
    );

    return ChangeProposal.create(sourceState, targetState);
  }
}
