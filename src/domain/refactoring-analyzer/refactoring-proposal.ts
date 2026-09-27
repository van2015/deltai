import { randomUUID } from 'node:crypto';

import type { CodeLocation } from './code-location.js';
import type { RefactoringType } from './refactoring-type.js';

export interface RefactoringProposalInput {
  readonly type: RefactoringType;
  readonly description: string;
  readonly rationale: string;
  readonly target: CodeLocation;
}

export class RefactoringProposal {
  private constructor(
    private readonly proposalId: string,
    private readonly proposalType: RefactoringType,
    private readonly proposalDescription: string,
    private readonly proposalRationale: string,
    private readonly proposalTarget: CodeLocation,
  ) {
    Object.freeze(this);
  }

  static of(input: RefactoringProposalInput): RefactoringProposal {
    return new RefactoringProposal(
      randomUUID(),
      input.type,
      input.description,
      input.rationale,
      input.target,
    );
  }

  get id(): string {
    return this.proposalId;
  }

  get type(): RefactoringType {
    return this.proposalType;
  }

  get description(): string {
    return this.proposalDescription;
  }

  get rationale(): string {
    return this.proposalRationale;
  }

  get target(): CodeLocation {
    return this.proposalTarget;
  }
}
