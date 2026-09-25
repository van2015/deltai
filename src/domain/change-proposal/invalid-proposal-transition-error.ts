import type { ProposalStatus } from './proposal-status.js';

export class InvalidProposalTransitionError extends Error {
  constructor(from: ProposalStatus, to: ProposalStatus) {
    super(`Cannot transition proposal from ${from} to ${to}`);
    this.name = 'InvalidProposalTransitionError';
  }
}
