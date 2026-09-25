import type { ProposalStatus } from '../change-proposal/proposal-status.js';

export class ProposalNotAcceptedError extends Error {
  constructor(status: ProposalStatus) {
    super(`Cannot apply a proposal in ${status} state`);
    this.name = 'ProposalNotAcceptedError';
  }
}
