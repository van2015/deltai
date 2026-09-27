import type { AgentGateway } from './agent-gateway.js';
import type { AnalyzeRefactoringsCommand } from './analyze-refactorings-command.js';
import type { ProjectRepository } from './project-repository.js';
import type { RefactoringProposal } from '../../domain/refactoring-analyzer/refactoring-proposal.js';

export class AnalyzeRefactorings {
  constructor(
    private readonly agentGateway: AgentGateway,
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(command: AnalyzeRefactoringsCommand): Promise<readonly RefactoringProposal[]> {
    const project = await this.projectRepository.get(command.projectId);
    const response = await this.agentGateway.analyze({
      projectState: project.currentState,
      sourceCode: command.sourceCode,
      ...(command.userIntent === undefined ? {} : { userIntent: command.userIntent }),
    });

    return [...response.proposals];
  }
}
