import { randomUUID } from 'node:crypto';

export interface CodeTarget {
  readonly path: string;
  readonly method: string;
}

export interface RefactoringProposalInput {
  readonly kind: string;
  readonly suggestion: string;
  readonly reason: string;
  readonly target: CodeTarget;
}

export class RefactoringProposal {
  static of(input: RefactoringProposalInput): RefactoringProposal {
    return new RefactoringProposal(
      randomUUID(),
      input.kind,
      input.suggestion,
      input.reason,
      { ...input.target },
    );
  }

  get id(): string {
    return this.proposalId;
  }

  get kind(): string {
    return this.proposalKind;
  }

  get reason(): string {
    return this.proposalReason;
  }

  get suggestion(): string {
    return this.proposalSuggestion;
  }

  get target(): CodeTarget {
    return this.proposalTarget;
  }

  private constructor(
    private readonly proposalId: string,
    private readonly proposalKind: string,
    private readonly proposalSuggestion: string,
    private readonly proposalReason: string,
    private readonly proposalTarget: CodeTarget,
  ) {
    Object.freeze(this.proposalTarget);
    Object.freeze(this);
  }
}
