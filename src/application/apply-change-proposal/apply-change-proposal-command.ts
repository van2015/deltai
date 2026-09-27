import type { ChangeProposal } from '../../domain/change-proposal/change-proposal.js';
import type { ProjectId } from '../../domain/project/project-state/project-id.js';

export class ApplyChangeProposalCommand {
  constructor(
    readonly projectId: ProjectId,
    readonly proposal: ChangeProposal,
  ) {}
}
