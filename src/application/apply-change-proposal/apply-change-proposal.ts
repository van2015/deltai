import type { ChangeProposal } from '../../domain/change-proposal/change-proposal.js';
import type { ProjectRepository } from '../analyze-refactorings/project-repository.js';
import type { ApplyChangeProposalCommand } from './apply-change-proposal-command.js';
import type { WorkspaceWriter } from './workspace-writer.js';

export class ApplyChangeProposal {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly workspaceWriter: WorkspaceWriter,
  ) {}

  async execute(command: ApplyChangeProposalCommand): Promise<ChangeProposal> {
    const project = await this.projectRepository.get(command.projectId);

    project.apply(command.proposal, (targetState) => {
      this.workspaceWriter.apply(targetState);
    });

    return command.proposal;
  }
}
