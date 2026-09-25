import { Change } from '../change-delta/change.js';

export class RejectedChange {
  private constructor(private readonly rejectedChange: Change) {
    Object.freeze(this);
  }

  static of(change: Change): RejectedChange {
    return new RejectedChange(change);
  }

  get change(): Change {
    return this.rejectedChange;
  }

  get elementId(): string | undefined {
    return this.rejectedChange.element?.id;
  }

  get relationshipId(): string | undefined {
    return this.rejectedChange.relationship?.id;
  }
}
